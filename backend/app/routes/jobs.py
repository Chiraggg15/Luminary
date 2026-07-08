"""
Job Application Routes  –  /api/jobs
--------------------------------------
GET    /api/jobs/        → List all job applications for current user
POST   /api/jobs/        → Create a new job application entry
PUT    /api/jobs/<id>    → Update a job entry (e.g. change status)
DELETE /api/jobs/<id>    → Delete a job entry
"""

from flask import Blueprint, request, jsonify
from app import db
from app.models.job import JobModel, VALID_STATUSES
from app.utils.jwt_helper import jwt_required_custom, get_current_user_id

jobs_bp = Blueprint("jobs", __name__)


# ────────────────────────────────────────────────────────────────────────────
# GET /api/jobs/  — List all job applications
# ────────────────────────────────────────────────────────────────────────────
@jobs_bp.route("/", methods=["GET"])
@jwt_required_custom
def list_jobs():
    """Return all job applications owned by the authenticated user."""
    user_id = get_current_user_id()
    jobs = JobModel.find_by_user(db, user_id)
    return jsonify({"jobs": jobs, "count": len(jobs)}), 200


# ────────────────────────────────────────────────────────────────────────────
# POST /api/jobs/  — Create a new job entry
# ────────────────────────────────────────────────────────────────────────────
@jobs_bp.route("/", methods=["POST"])
@jwt_required_custom
def create_job():
    """Create and store a new job application entry."""
    user_id = get_current_user_id()
    data = request.get_json() or {}

    if not data.get("company") or not data.get("job_title"):
        return jsonify({"error": "company and job_title are required"}), 400

    if data.get("status") and data["status"] not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    job = JobModel.create(db, user_id, data)
    return jsonify({"message": "Job entry created", "job": job}), 201


# ────────────────────────────────────────────────────────────────────────────
# PUT /api/jobs/<id>  — Update a job entry
# ────────────────────────────────────────────────────────────────────────────
@jobs_bp.route("/<job_id>", methods=["PUT"])
@jwt_required_custom
def update_job(job_id):
    """Update fields of an existing job application entry."""
    user_id = get_current_user_id()
    job = JobModel.find_by_id(db, job_id)

    if not job:
        return jsonify({"error": "Job entry not found"}), 404
    if job.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}
    if data.get("status") and data["status"] not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    JobModel.update(db, job_id, data)
    updated = JobModel.find_by_id(db, job_id)
    return jsonify({"message": "Job entry updated", "job": JobModel.serialize(updated)}), 200


# ────────────────────────────────────────────────────────────────────────────
# DELETE /api/jobs/<id>  — Delete a job entry
# ────────────────────────────────────────────────────────────────────────────
@jobs_bp.route("/<job_id>", methods=["DELETE"])
@jwt_required_custom
def delete_job(job_id):
    """Permanently delete a job application entry."""
    user_id = get_current_user_id()
    job = JobModel.find_by_id(db, job_id)

    if not job:
        return jsonify({"error": "Job entry not found"}), 404
    if job.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403

    JobModel.delete(db, job_id)
    return jsonify({"message": "Job entry deleted successfully"}), 200
