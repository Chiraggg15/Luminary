"""
Mock Interview Route  –  /api/interview
-----------------------------------------
POST /api/interview/generate  → Generate interview Q&A for a job role
"""

from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.utils.jwt_helper import jwt_required_custom

interview_bp = Blueprint("interview", __name__)


@interview_bp.route("/generate", methods=["POST"])
@jwt_required_custom
def generate_questions():
    """
    Generate a set of mock interview questions and model answers
    based on the target job role, skills, and experience level.

    Body:
      job_title      str   required
      skills         [str] optional
      experience     int   optional (years)
      question_count int   optional (default 7)
    """
    data = request.get_json() or {}

    if not data.get("job_title"):
        return jsonify({"error": "job_title is required"}), 400

    try:
        result = AIService.generate_interview_questions(
            job_title=data["job_title"],
            skills=data.get("skills", []),
            experience_years=data.get("experience", 0),
            count=min(int(data.get("question_count", 7)), 15),  # cap at 15
        )
        return jsonify({"questions": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/interview/evaluate
# Body: { "question": str, "user_answer": str, "model_answer": str, "job_title": str }
# ────────────────────────────────────────────────────────────────────────────
@interview_bp.route("/evaluate", methods=["POST"])
@jwt_required_custom
def evaluate_answer():
    """
    Evaluate a user's practice answer against the AI model answer.
    Returns a score, strengths, and improvement tips.
    """
    data = request.get_json() or {}

    if not data.get("question") or not data.get("user_answer"):
        return jsonify({"error": "question and user_answer are required"}), 400

    try:
        result = AIService.evaluate_answer(
            question=data["question"],
            user_answer=data["user_answer"],
            model_answer=data.get("model_answer", ""),
            job_title=data.get("job_title", ""),
        )
        return jsonify({"evaluation": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
