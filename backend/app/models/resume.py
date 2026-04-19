"""
Resume Model
------------
MongoDB schema representation and helper methods for the Resume collection.

MongoDB Document Structure:
{
  "_id": ObjectId,
  "user_id": str,               # Reference to users._id
  "title": str,                 # e.g. "Software Engineer Resume"
  "template": str,              # Template name for rendering
  "personal_info": {
    "full_name": str,
    "email": str,
    "phone": str,
    "location": str,
    "linkedin": str,
    "github": str,
    "portfolio": str,
    "summary": str              # Professional summary (AI-generated or manual)
  },
  "experience": [
    {
      "company": str,
      "position": str,
      "start_date": str,
      "end_date": str,          # "Present" if current
      "description": str,       # Bullet points as text
      "is_current": bool
    }
  ],
  "education": [
    {
      "institution": str,
      "degree": str,
      "field_of_study": str,
      "start_date": str,
      "end_date": str,
      "grade": str,
      "description": str
    }
  ],
  "skills": {
    "technical": [str],         # e.g. ["Python", "React", "MongoDB"]
    "soft": [str]               # e.g. ["Leadership", "Communication"]
  },
  "projects": [
    {
      "name": str,
      "description": str,
      "technologies": [str],
      "url": str
    }
  ],
  "certifications": [
    {
      "name": str,
      "issuer": str,
      "date": str,
      "url": str
    }
  ],
  "languages": [
    { "language": str, "proficiency": str }
  ],
  "ats_score": int | None,      # Last analyzed ATS score (0-100)
  "is_ai_generated": bool,
  "created_at": datetime,
  "updated_at": datetime
}
"""

from datetime import datetime, timezone
from bson import ObjectId


class ResumeModel:
    """Helper class for Resume CRUD operations."""

    COLLECTION = "resumes"

    @staticmethod
    def create(db, user_id: str, data: dict) -> dict:
        """Insert a new resume document."""
        now = datetime.now(timezone.utc)
        resume_doc = {
            "user_id": user_id,
            "title": data.get("title", "My Resume"),
            "template": data.get("template", "modern"),
            "personal_info": data.get("personal_info", {}),
            "experience": data.get("experience", []),
            "education": data.get("education", []),
            "skills": data.get("skills", {"technical": [], "soft": []}),
            "projects": data.get("projects", []),
            "certifications": data.get("certifications", []),
            "languages": data.get("languages", []),
            "ats_score": None,
            "is_ai_generated": data.get("is_ai_generated", False),
            "created_at": now,
            "updated_at": now,
        }
        result = db[ResumeModel.COLLECTION].insert_one(resume_doc)
        resume_doc["_id"] = str(result.inserted_id)
        return resume_doc

    @staticmethod
    def find_by_user(db, user_id: str) -> list:
        """Return all resumes belonging to a user, newest first."""
        cursor = db[ResumeModel.COLLECTION].find(
            {"user_id": user_id}
        ).sort("created_at", -1)
        return [ResumeModel.serialize(r) for r in cursor]

    @staticmethod
    def find_by_id(db, resume_id: str) -> dict | None:
        """Find a single resume by its ObjectId string."""
        try:
            return db[ResumeModel.COLLECTION].find_one({"_id": ObjectId(resume_id)})
        except Exception:
            return None

    @staticmethod
    def update(db, resume_id: str, data: dict) -> bool:
        """Update allowed fields of a resume."""
        allowed_fields = [
            "title", "template", "personal_info", "experience",
            "education", "skills", "projects", "certifications", "languages",
        ]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        update_data["updated_at"] = datetime.now(timezone.utc)

        result = db[ResumeModel.COLLECTION].update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": update_data},
        )
        return result.modified_count > 0

    @staticmethod
    def update_ats_score(db, resume_id: str, score: int) -> bool:
        """Store the latest ATS analysis score."""
        result = db[ResumeModel.COLLECTION].update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": {"ats_score": score, "updated_at": datetime.now(timezone.utc)}},
        )
        return result.modified_count > 0

    @staticmethod
    def delete(db, resume_id: str) -> bool:
        """Delete a resume by ID."""
        result = db[ResumeModel.COLLECTION].delete_one({"_id": ObjectId(resume_id)})
        return result.deleted_count > 0

    @staticmethod
    def serialize(resume_doc: dict) -> dict:
        """Convert MongoDB document to JSON-safe dict."""
        doc = dict(resume_doc)
        doc["id"] = str(doc.pop("_id"))
        doc["created_at"] = str(doc.get("created_at", ""))
        doc["updated_at"] = str(doc.get("updated_at", ""))
        return doc

    # ── Snapshot / Version History ────────────────────────────────────────────

    SNAPSHOT_COLLECTION = "resume_snapshots"
    MAX_SNAPSHOTS = 10

    @staticmethod
    def save_snapshot(db, resume_id: str, resume_data: dict) -> None:
        """Save the current state of a resume as a versioned snapshot."""
        now = datetime.now(timezone.utc)
        snapshot = {
            "resume_id": resume_id,
            "saved_at": now,
            "data": {k: v for k, v in resume_data.items() if k not in ("_id", "user_id")},
        }
        db[ResumeModel.SNAPSHOT_COLLECTION].insert_one(snapshot)

        # Keep only the last MAX_SNAPSHOTS
        all_snaps = list(db[ResumeModel.SNAPSHOT_COLLECTION].find(
            {"resume_id": resume_id}
        ).sort("saved_at", -1))

        if len(all_snaps) > ResumeModel.MAX_SNAPSHOTS:
            old_ids = [s["_id"] for s in all_snaps[ResumeModel.MAX_SNAPSHOTS:]]
            db[ResumeModel.SNAPSHOT_COLLECTION].delete_many({"_id": {"$in": old_ids}})

    @staticmethod
    def get_snapshots(db, resume_id: str) -> list:
        """Return all snapshots for a resume, newest first."""
        cursor = db[ResumeModel.SNAPSHOT_COLLECTION].find(
            {"resume_id": resume_id}
        ).sort("saved_at", -1)
        result = []
        for snap in cursor:
            result.append({
                "id": str(snap["_id"]),
                "saved_at": str(snap["saved_at"]),
            })
        return result

    @staticmethod
    def restore_snapshot(db, resume_id: str, snapshot_id: str) -> bool:
        """Restore a resume to a specific snapshot state."""
        try:
            snap = db[ResumeModel.SNAPSHOT_COLLECTION].find_one(
                {"_id": ObjectId(snapshot_id), "resume_id": resume_id}
            )
        except Exception:
            return False

        if not snap:
            return False

        restore_data = snap["data"]
        restore_data["updated_at"] = datetime.now(timezone.utc)
        db[ResumeModel.COLLECTION].update_one(
            {"_id": ObjectId(resume_id)},
            {"$set": restore_data},
        )
        return True
