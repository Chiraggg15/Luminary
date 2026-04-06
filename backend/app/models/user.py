"""
User Model
----------
MongoDB schema representation and helper methods for the User collection.
No ORM is used — we interact with MongoDB directly via PyMongo.

MongoDB Document Structure:
{
  "_id": ObjectId,
  "full_name": str,
  "email": str (unique),
  "password_hash": str,         # bcrypt hash 
  "created_at": datetime,
  "updated_at": datetime,
  "profile": {
    "phone": str,
    "location": str,
    "linkedin": str,
    "github": str,
    "portfolio": str,
    "summary": str
  }
}
"""

from datetime import datetime, timezone
from bson import ObjectId
import bcrypt


class UserModel:
    """Helper class for User CRUD operations."""

    COLLECTION = "users"

    @staticmethod
    def hash_password(plain_password: str) -> str:
        """Hash a plain-text password using bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed: str) -> bool:
        """Return True if the plain password matches the stored hash."""
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed.encode("utf-8"))

    @staticmethod
    def create(db, full_name: str, email: str, password: str) -> dict:
        """
        Insert a new user document into the database.
        Returns the inserted document with string _id.
        """
        now = datetime.now(timezone.utc)
        user_doc = {
            "full_name": full_name,
            "email": email.lower().strip(),
            "password_hash": UserModel.hash_password(password) if password else None,
            "google_id": None, # Will be set for Google users
            "created_at": now,
            "updated_at": now,
            "profile": {
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": "",
                "portfolio": "",
                "summary": "",
            },
        }
        result = db[UserModel.COLLECTION].insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        return user_doc

    @staticmethod
    def find_by_email(db, email: str) -> dict | None:
        """Find a user by email (case-insensitive)."""
        return db[UserModel.COLLECTION].find_one({"email": email.lower().strip()})

    @staticmethod
    def find_by_google_id(db, google_id: str) -> dict | None:
        """Find a user by their Google unique ID."""
        return db[UserModel.COLLECTION].find_one({"google_id": google_id})

    @staticmethod
    def link_google_account(db, user_id: str, google_id: str) -> bool:
        """Link a Google ID to an existing email-based account."""
        result = db[UserModel.COLLECTION].update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "google_id": google_id,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        return result.modified_count > 0

    @staticmethod
    def find_by_id(db, user_id: str) -> dict | None:
        """Find a user by their ObjectId string."""
        try:
            return db[UserModel.COLLECTION].find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def update_profile(db, user_id: str, profile_data: dict) -> bool:
        """Update the profile sub-document of a user."""
        result = db[UserModel.COLLECTION].update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    **{f"profile.{k}": v for k, v in profile_data.items()},
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        return result.modified_count > 0

    @staticmethod
    def serialize(user_doc: dict) -> dict:
        """Convert a MongoDB document to a JSON-safe dict (removes password hash)."""
        return {
            "id": str(user_doc["_id"]),
            "full_name": user_doc.get("full_name", ""),
            "email": user_doc.get("email", ""),
            "profile": user_doc.get("profile", {}),
            "created_at": str(user_doc.get("created_at", "")),
        }
