"""
Resume Routes  –  /api/resume
------------------------------
GET    /api/resume/           → List all resumes for current user
POST   /api/resume/           → Create a new resume
GET    /api/resume/<id>       → Get a specific resume
PUT    /api/resume/<id>       → Update a resume
DELETE /api/resume/<id>       → Delete a resume
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models.resume import ResumeModel
from app.utils.jwt_helper import jwt_required_custom, get_current_user_id

resume_bp = Blueprint("resume", __name__)


# ────────────────────────────────────────────────────────────────────────────
# GET /api/resume/  — List all user resumes
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/", methods=["GET"])
@jwt_required_custom
def list_resumes():
    """Return all resumes owned by the authenticated user."""
    user_id = get_current_user_id()
    resumes = ResumeModel.find_by_user(db, user_id)
    return jsonify({"resumes": resumes, "count": len(resumes)}), 200


# ────────────────────────────────────────────────────────────────────────────
# POST /api/resume/  — Create a new resume
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/", methods=["POST"])
@jwt_required_custom
def create_resume():
    """Create and store a new resume document for the current user."""
    user_id = get_current_user_id()
    data = request.get_json() or {}

    resume = ResumeModel.create(db, user_id, data)
    return jsonify({
        "message": "Resume created successfully",
        "resume": resume,
    }), 201


# ────────────────────────────────────────────────────────────────────────────
# GET /api/resume/<id>  — Get one resume
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/<resume_id>", methods=["GET"])
@jwt_required_custom
def get_resume(resume_id):
    """Fetch a single resume by ID (must belong to the current user)."""
    user_id = get_current_user_id()
    resume = ResumeModel.find_by_id(db, resume_id)

    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    # Authorization check: ensure the resume belongs to the requesting user
    if resume.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify(ResumeModel.serialize(resume)), 200


# ────────────────────────────────────────────────────────────────────────────
# PUT /api/resume/<id>  — Update a resume
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/<resume_id>", methods=["PUT"])
@jwt_required_custom
def update_resume(resume_id):
    """Update fields of an existing resume."""
    user_id = get_current_user_id()
    resume = ResumeModel.find_by_id(db, resume_id)

    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    if resume.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}

    # Save current state as a snapshot before overwriting
    try:
        ResumeModel.save_snapshot(db, resume_id, dict(resume))
    except Exception:
        pass  # Non-critical: don't fail the save if snapshot fails

    ResumeModel.update(db, resume_id, data)

    updated = ResumeModel.find_by_id(db, resume_id)
    return jsonify({
        "message": "Resume updated",
        "resume": ResumeModel.serialize(updated),
    }), 200


# ────────────────────────────────────────────────────────────────────────────
# DELETE /api/resume/<id>  — Delete a resume
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/<resume_id>", methods=["DELETE"])
@jwt_required_custom
def delete_resume(resume_id):
    """Permanently delete a resume."""
    user_id = get_current_user_id()
    resume = ResumeModel.find_by_id(db, resume_id)

    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    if resume.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403

    ResumeModel.delete(db, resume_id)
    return jsonify({"message": "Resume deleted successfully"}), 200


# ────────────────────────────────────────────────────────────────────────────
# GET /api/resume/<id>/history  — List snapshots
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/<resume_id>/history", methods=["GET"])
@jwt_required_custom
def get_history(resume_id):
    """Return version snapshots for a resume."""
    user_id = get_current_user_id()
    resume = ResumeModel.find_by_id(db, resume_id)
    if not resume or resume.get("user_id") != user_id:
        return jsonify({"error": "Not found or access denied"}), 404

    snapshots = ResumeModel.get_snapshots(db, resume_id)
    return jsonify({"snapshots": snapshots}), 200


# ────────────────────────────────────────────────────────────────────────────
# POST /api/resume/<id>/restore/<snapshot_id>  — Restore a snapshot
# ────────────────────────────────────────────────────────────────────────────
@resume_bp.route("/<resume_id>/restore/<snapshot_id>", methods=["POST"])
@jwt_required_custom
def restore_snapshot(resume_id, snapshot_id):
    """Restore a resume from a specific snapshot."""
    user_id = get_current_user_id()
    resume = ResumeModel.find_by_id(db, resume_id)
    if not resume or resume.get("user_id") != user_id:
        return jsonify({"error": "Not found or access denied"}), 404

    restored = ResumeModel.restore_snapshot(db, resume_id, snapshot_id)
    if not restored:
        return jsonify({"error": "Snapshot not found"}), 404

    updated = ResumeModel.find_by_id(db, resume_id)
    return jsonify({
        "message": "Resume restored successfully",
        "resume": ResumeModel.serialize(updated),
    }), 200
