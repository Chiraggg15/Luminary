"""
AI Routes  –  /api/ai
----------------------
POST /api/ai/generate          → Generate full resume content using GPT
POST /api/ai/analyze           → Analyze resume vs job description (NLP)
POST /api/ai/cover-letter      → Generate a tailored cover letter
POST /api/ai/improve-summary   → Rewrite/improve a professional summary
"""

from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.services.nlp_service import NLPService
from app.utils.jwt_helper import jwt_required_custom

ai_bp = Blueprint("ai", __name__)


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/generate
# Body: { "job_title": str, "skills": [str], "experience_years": int,
#         "industry": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/generate", methods=["POST"])
@jwt_required_custom
def generate_resume():
    """
    Generate AI-powered resume content based on the user's inputs.
    Returns structured resume data ready to be saved.
    """
    data = request.get_json() or {}

    if not data.get("job_title"):
        return jsonify({"error": "job_title is required"}), 400

    try:
        result = AIService.generate_resume_content(
            job_title=data.get("job_title", ""),
            skills=data.get("skills", []),
            experience_years=data.get("experience_years", 0),
            industry=data.get("industry", "Technology"),
            extra_info=data.get("extra_info", ""),
        )
        return jsonify({"generated": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/analyze
# Body: { "resume_text": str, "job_description": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/analyze", methods=["POST"])
@jwt_required_custom
def analyze_resume():
    """
    Extract keywords from job description, compare with resume,
    and return ATS score + missing skills + suggestions.
    """
    data = request.get_json() or {}

    if not data.get("resume_text") or not data.get("job_description"):
        return jsonify({"error": "resume_text and job_description are required"}), 400

    try:
        analysis = NLPService.analyze_resume(
            resume_text=data["resume_text"],
            job_description=data["job_description"],
        )
        return jsonify({"analysis": analysis}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/cover-letter
# Body: { "resume_summary": str, "job_description": str,
#         "company_name": str, "applicant_name": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/cover-letter", methods=["POST"])
@jwt_required_custom
def generate_cover_letter():
    """Generate a personalized cover letter using GPT."""
    data = request.get_json() or {}
    
    # Handle both frontend naming conventions
    resume_summary  = data.get("resume_summary", "").strip()
    job_description = data.get("job_description", "").strip()
    company_name    = (data.get("company_name") or data.get("company") or "").strip()
    applicant_name  = (data.get("applicant_name") or "Applicant").strip()

    if not company_name:
        return jsonify({"error": "'company_name' is required"}), 400
    if not resume_summary:
        return jsonify({"error": "'resume_summary' is required"}), 400

    try:
        letter = AIService.generate_cover_letter(
            resume_summary=resume_summary,
            job_description=job_description or "General professional role",
            company_name=company_name,
            applicant_name=applicant_name,
        )
        return jsonify({"cover_letter": letter}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/improve-summary
# Body: { "summary": str, "job_title": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/improve-summary", methods=["POST"])
@jwt_required_custom
def improve_summary():
    """Rewrite a professional summary to be more impactful and ATS-friendly."""
    data = request.get_json() or {}

    if not data.get("summary"):
        return jsonify({"error": "summary is required"}), 400

    try:
        improved = AIService.improve_summary(
            summary=data["summary"],
            job_title=data.get("job_title", ""),
        )
        return jsonify({"improved_summary": improved}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/analyze-detailed
# Body: { "resume_text": str, "job_description": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/analyze-detailed", methods=["POST"])
@jwt_required_custom
def analyze_resume_detailed():
    """Return a detailed ATS breakdown: found/missing keywords, section scores, suggestions."""
    data = request.get_json() or {}

    if not data.get("resume_text") or not data.get("job_description"):
        return jsonify({"error": "resume_text and job_description are required"}), 400

    try:
        result = AIService.analyze_resume_detailed(
            resume_text=data["resume_text"],
            job_description=data["job_description"],
        )
        return jsonify({"analysis": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /api/ai/salary ────────────────────────────────────────────────────
@ai_bp.route("/salary", methods=["POST"])
@jwt_required_custom
def estimate_salary():
    """Estimate salary range for a job title, location, and experience level."""
    data = request.get_json() or {}
    if not data.get("job_title"):
        return jsonify({"error": "job_title is required"}), 400
    try:
        result = AIService.estimate_salary(
            job_title=data["job_title"],
            location=data.get("location", "United States"),
            experience_years=int(data.get("experience_years", 0)),
            skills=data.get("skills", []),
        )
        return jsonify({"salary": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /api/ai/skill-gap ────────────────────────────────────────────────
@ai_bp.route("/skill-gap", methods=["POST"])
@jwt_required_custom
def skill_gap():
    """Analyze skill gap between current skills and a target role."""
    data = request.get_json() or {}
    if not data.get("target_role"):
        return jsonify({"error": "target_role is required"}), 400
    try:
        result = AIService.analyze_skill_gap(
            current_skills=data.get("current_skills", []),
            target_role=data["target_role"],
            experience_years=int(data.get("experience_years", 0)),
        )
        return jsonify({"gap": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /api/ai/grammar-check ────────────────────────────────────────────
@ai_bp.route("/grammar-check", methods=["POST"])
@jwt_required_custom
def grammar_check():
    """Check resume text for grammar, weak verbs, and passive voice issues."""
    data = request.get_json() or {}
    if not data.get("text"):
        return jsonify({"error": "text is required"}), 400
    try:
        result = AIService.check_grammar(text=data["text"])
        return jsonify({"check": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /api/ai/translate ────────────────────────────────────────────────
@ai_bp.route("/translate", methods=["POST"])
@jwt_required_custom
def translate_resume():
    """Translate resume text fields to a target language."""
    data = request.get_json() or {}
    if not data.get("target_language") or not data.get("resume_data"):
        return jsonify({"error": "target_language and resume_data are required"}), 400
    try:
        result = AIService.translate_resume(
            resume_data=data["resume_data"],
            target_language=data["target_language"],
        )
        return jsonify({"translated": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── POST /api/ai/email-cover-letter ──────────────────────────────────────
@ai_bp.route("/email-cover-letter", methods=["POST"])
@jwt_required_custom
def email_cover_letter():
    """Send a cover letter via email."""
    from app import mail
    from flask_mail import Message
    data = request.get_json() or {}
    recipient = data.get("recipient_email", "").strip()
    cover_letter = data.get("cover_letter", "").strip()
    subject = data.get("subject", "Job Application — Cover Letter").strip()
    sender_name = data.get("sender_name", "Applicant").strip()

    if not recipient or not cover_letter:
        return jsonify({"error": "recipient_email and cover_letter are required"}), 400

    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            body=f"{cover_letter}\n\n---\nSent via Luminary AI Resume Builder",
        )
        mail.send(msg)
        return jsonify({"message": f"Cover letter sent to {recipient}"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500
