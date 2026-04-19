"""
Auth Routes  –  /api/auth
--------------------------
POST /api/auth/register   → Create a new user account
POST /api/auth/login      → Login and receive JWT
GET  /api/auth/me         → Get current user profile (protected)
PUT  /api/auth/me         → Update profile (protected)
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
from app import db
from app.models.user import UserModel
from app.utils.validators import is_valid_email, is_strong_password, validate_required_fields
from app.utils.jwt_helper import jwt_required_custom, get_current_user_id
from app.utils.mailer import send_reset_password_email
import secrets
from datetime import datetime, timedelta, timezone

auth_bp = Blueprint("auth", __name__)


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user and return a JWT token."""
    data = request.get_json() or {}

    # Validate required fields
    ok, err = validate_required_fields(data, ["full_name", "email", "password"])
    if not ok:
        return jsonify({"error": err}), 400

    # Validate email format
    if not is_valid_email(data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    # Validate password strength
    ok, err = is_strong_password(data["password"])
    if not ok:
        return jsonify({"error": err}), 400

    # Check if email already registered
    if UserModel.find_by_email(db, data["email"]):
        return jsonify({"error": "Email already registered"}), 409

    # Create user
    user = UserModel.create(db, data["full_name"], data["email"], data["password"])

    # Generate JWT (identity = user id string)
    token = create_access_token(identity=user["_id"])

    return jsonify({
        "message": "Account created successfully",
        "token": token,
        "user": UserModel.serialize(user),
    }), 201


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return a JWT token."""
    data = request.get_json() or {}

    ok, err = validate_required_fields(data, ["email", "password"])
    if not ok:
        return jsonify({"error": err}), 400

    user = UserModel.find_by_email(db, data["email"])
    if not user or not UserModel.verify_password(data["password"], user["password_hash"]):
        # Generic message to prevent user enumeration
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": UserModel.serialize(user),
    }), 200


# ────────────────────────────────────────────────────────────────────────────
# GET /api/auth/me
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required_custom
def get_me():
    """Return the currently authenticated user's profile."""
    user_id = get_current_user_id()
    user = UserModel.find_by_id(db, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(UserModel.serialize(user)), 200


# ────────────────────────────────────────────────────────────────────────────
# PUT /api/auth/me
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["PUT"])
@jwt_required_custom
def update_me():
    """Update the authenticated user's profile information."""
    user_id = get_current_user_id()
    data = request.get_json() or {}

    # Only allow updating profile sub-document fields
    allowed = ["phone", "location", "linkedin", "github", "portfolio", "summary"]
    profile_data = {k: v for k, v in data.items() if k in allowed}

    if not profile_data:
        return jsonify({"error": "No valid fields to update"}), 400

    UserModel.update_profile(db, user_id, profile_data)
    user = UserModel.find_by_id(db, user_id)
    return jsonify({
        "message": "Profile updated",
        "user": UserModel.serialize(user),
    }), 200


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/google-login
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/google-login", methods=["POST"])
def google_login():
    """Verify Google token, then find/link or create user."""
    data = request.get_json() or {}
    token = data.get("credential")

    if not token:
        return jsonify({"error": "Credential token is required"}), 400

    try:
        # 1. Verify ID Token from Google
        client_id = current_app.config.get("GOOGLE_CLIENT_ID")
        print(f"DEBUG: Verifying Google Token for Client ID: {client_id}")
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)

        # 2. Extract user info
        google_id = idinfo["sub"]
        email     = idinfo["email"].lower().strip()
        full_name = idinfo.get("name", "Google User")

        # 3. Check for existing user by google_id
        user = UserModel.find_by_google_id(db, google_id)

        if not user:
            # 4. If not found by google_id, check by email (Account Linking)
            user = UserModel.find_by_email(db, email)
            if user:
                # Link Google ID to existing manual account
                UserModel.link_google_account(db, str(user["_id"]), google_id)
                user["google_id"] = google_id
            else:
                # 5. Create new account if neither exists
                user = UserModel.create(db, full_name, email, password=None)
                UserModel.link_google_account(db, user["_id"], google_id)
                user["google_id"] = google_id

        # 6. Success -> Return JWT
        access_token = create_access_token(identity=str(user["_id"]))

        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": UserModel.serialize(user),
        }), 200

    except ValueError:
        return jsonify({"error": "Invalid Google token"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/forgot-password
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Generate a reset token and send an email to the user."""
    data = request.get_json() or {}
    email = data.get("email")

    if not email or not is_valid_email(email):
        return jsonify({"error": "Valid email is required"}), 400

    user = UserModel.find_by_email(db, email)
    if not user:
        # Return success even if user not found to prevent email enumeration
        return jsonify({"message": "If that email exists, a reset link has been sent."}), 200

    # Generate secure token
    token = secrets.token_urlsafe(32)
    expiry = datetime.now(timezone.utc) + timedelta(hours=1)

    # Save to DB
    UserModel.set_reset_token(db, email, token, expiry)

    # Send Email
    reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password/{token}"
    sent = send_reset_password_email(email, user.get("full_name", "User"), reset_link)

    if not sent:
        # If email fails, in debug mode we already printed it to console
        return jsonify({"message": "Reset link generated (check server logs in dev mode)"}), 200

    return jsonify({"message": "Reset link has been sent to your email."}), 200


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/reset-password
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Verify reset token and update user's password."""
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"error": "Token and password are required"}), 400

    # Validate new password strength
    ok, err = is_strong_password(new_password)
    if not ok:
        return jsonify({"error": err}), 400

    # Find user by valid token
    user = UserModel.find_by_reset_token(db, token)
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    # Update password
    success = UserModel.reset_password(db, str(user["_id"]), new_password)
    if not success:
        return jsonify({"error": "Failed to reset password"}), 500

    return jsonify({"message": "Password has been reset successfully"}), 200
