"""
Job Application Model
---------------------
Handles CRUD for job application tracking entries in MongoDB.
Collection: job_applications
"""

from datetime import datetime, timezone
from bson import ObjectId


VALID_STATUSES = ["wishlist", "applied", "interview", "offer", "rejected"]


class JobModel:

    COLLECTION = "job_applications"

    @staticmethod
    def serialize(doc: dict) -> dict:
        """Convert a MongoDB document to a JSON-serialisable dict."""
        if not doc:
            return {}
        return {
            "id":          str(doc["_id"]),
            "user_id":     str(doc.get("user_id", "")),
            "company":     doc.get("company", ""),
            "job_title":   doc.get("job_title", ""),
            "status":      doc.get("status", "wishlist"),
            "job_url":     doc.get("job_url", ""),
            "notes":       doc.get("notes", ""),
            "salary":      doc.get("salary", ""),
            "location":    doc.get("location", ""),
            "applied_date": doc.get("applied_date", ""),
            "created_at":  doc.get("created_at", datetime.now(timezone.utc)).isoformat(),
            "updated_at":  doc.get("updated_at", datetime.now(timezone.utc)).isoformat(),
        }

    @staticmethod
    def find_by_user(db, user_id: str) -> list:
        """Return all job entries for a user, newest first."""
        docs = db[JobModel.COLLECTION].find(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        return [JobModel.serialize(d) for d in docs]

    @staticmethod
    def find_by_id(db, job_id: str) -> dict | None:
        """Find a single job entry by its ObjectId."""
        try:
            return db[JobModel.COLLECTION].find_one({"_id": ObjectId(job_id)})
        except Exception:
            return None

    @staticmethod
    def create(db, user_id: str, data: dict) -> dict:
        """Insert a new job application entry."""
        now = datetime.now(timezone.utc)
        doc = {
            "user_id":     user_id,
            "company":     data.get("company", "").strip(),
            "job_title":   data.get("job_title", "").strip(),
            "status":      data.get("status", "wishlist"),
            "job_url":     data.get("job_url", "").strip(),
            "notes":       data.get("notes", "").strip(),
            "salary":      data.get("salary", "").strip(),
            "location":    data.get("location", "").strip(),
            "applied_date": data.get("applied_date", ""),
            "created_at":  now,
            "updated_at":  now,
        }
        result = db[JobModel.COLLECTION].insert_one(doc)
        doc["_id"] = result.inserted_id
        return JobModel.serialize(doc)

    @staticmethod
    def update(db, job_id: str, data: dict) -> bool:
        """Update allowed fields on an existing entry."""
        allowed = ["company", "job_title", "status", "job_url",
                   "notes", "salary", "location", "applied_date"]
        updates = {k: v for k, v in data.items() if k in allowed}
        updates["updated_at"] = datetime.now(timezone.utc)

        result = db[JobModel.COLLECTION].update_one(
            {"_id": ObjectId(job_id)},
            {"$set": updates}
        )
        return result.modified_count > 0

    @staticmethod
    def delete(db, job_id: str) -> bool:
        """Permanently delete a job entry."""
        result = db[JobModel.COLLECTION].delete_one({"_id": ObjectId(job_id)})
        return result.deleted_count > 0
