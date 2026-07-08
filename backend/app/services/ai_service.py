"""
AI Service
----------
Handles all OpenAI GPT API calls for:
  - Resume content generation
  - Cover letter generation
  - Professional summary improvement

NOTE: Requires OPENAI_API_KEY set in .env
"""

import os
import re
import google.generativeai as genai
from flask import current_app

# Initialize Gemini model (lazy-loading)
_model = None


def _get_model():
    """Configure and return the Gemini model."""
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel('gemini-flash-latest')
    return _model


def _chat(system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> str:
    """
    Send a prompt to Gemini and return the response text.
    Uses gemini-1.5-flash for speed and efficiency.
    """
    model = _get_model()
    # Combine system and user prompts for Gemini (or use system_instruction if supported)
    # For simplicity and compatibility, we prepend the system prompt:
    full_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
    
    response = model.generate_content(
        full_prompt,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.7,
        )
    )
    return response.text.strip()


class AIService:

    @staticmethod
    def generate_resume_content(
        job_title: str,
        skills: list,
        experience_years: int,
        industry: str,
        extra_info: str = "",
    ) -> dict:
        """
        Generate ATS-friendly resume content based on user inputs.
        Returns a dict with: summary, experience bullets, and skills list.
        """
        system = (
            "You are an expert resume writer specializing in ATS-optimized resumes. "
            "Always write in first-person, use strong action verbs, and include quantifiable achievements."
        )
        skills_str = ", ".join(skills) if skills else "general professional skills"
        user = (
            f"Generate a professional resume section for a {job_title} with {experience_years} years "
            f"of experience in the {industry} industry. Skills: {skills_str}. "
            f"Additional info: {extra_info}\n\n"
            "Provide:\n"
            "1. A 2-3 sentence professional summary\n"
            "2. 4 strong bullet points for work experience\n"
            "3. A list of 8 relevant technical skills\n\n"
            "Format as:\nSUMMARY:\n[summary]\n\nEXPERIENCE BULLETS:\n[bullets]\n\nSKILLS:\n[skills]"
        )
        raw = _chat(system, user, max_tokens=800)

        # Parse the structured response into a dict
        sections = {"summary": "", "experience_bullets": [], "skills": []}
        current = None
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("SUMMARY:"):
                current = "summary"
            elif line.startswith("EXPERIENCE BULLETS:"):
                current = "bullets"
            elif line.startswith("SKILLS:"):
                current = "skills"
            elif line and current == "summary":
                sections["summary"] += line + " "
            elif line and current == "bullets" and (line.startswith("-") or line.startswith("•")):
                sections["experience_bullets"].append(line.lstrip("-•").strip())
            elif line and current == "skills":
                sections["skills"].extend([s.strip() for s in line.split(",") if s.strip()])

        return {
            "summary": sections["summary"].strip(),
            "experience_bullets": sections["experience_bullets"],
            "suggested_skills": sections["skills"],
        }

    @staticmethod
    def generate_cover_letter(
        resume_summary: str,
        job_description: str,
        company_name: str,
        applicant_name: str,
    ) -> str:
        """Generate a personalized, professional cover letter."""
        system = (
            "You are an expert career coach who writes compelling, personalized cover letters. "
            "Always write a COMPLETE cover letter with exactly 2 well-developed paragraphs. "
            "Never cut off mid-sentence. Every letter must have a greeting, 2 full paragraphs, and a sign-off."
        )
        user = (
            f"Write a complete professional cover letter for {applicant_name} applying to {company_name}.\n\n"
            f"Applicant summary: {resume_summary}\n\n"
            f"Job description: {job_description}\n\n"
            "Structure the letter EXACTLY as follows — do not skip any section:\n"
            "1. Greeting: Dear [Company] Recruiting Team,\n"
            "2. Paragraph 1 (5-6 sentences): Express enthusiasm for the role, highlight your strongest qualifications, and match your key skills and achievements to the job requirements.\n"
            "3. Paragraph 2 (3-4 sentences): Reiterate your interest, mention availability for an interview, and thank them.\n"
            "4. Sign-off: Sincerely, [Name]\n\n"
            "Write the FULL letter now. Do not truncate or summarize."
        )
        return _chat(system, user, max_tokens=1200)

    @staticmethod
    def improve_summary(summary: str, job_title: str = "") -> str:
        """Rewrite a professional summary to be more impactful and ATS-friendly."""
        system = (
            "You are an expert resume writer. Rewrite professional summaries to be "
            "concise, impactful, ATS-friendly, and packed with relevant keywords."
        )
        context = f" for a {job_title} role" if job_title else ""
        user = (
            f"Rewrite this professional summary{context} to be more compelling (max 3 sentences):\n\n{summary}"
        )
        return _chat(system, user, max_tokens=300)

    @staticmethod
    def generate_interview_questions(job_title: str, skills: list, experience_years: int, count: int = 7) -> list[dict]:
        """Generate tailored mock interview questions with sample model answers."""
        system = (
            "You are an expert technical interviewer and career coach. "
            "Generate interview questions with brief, excellent model answers."
        )
        skills_str = ", ".join(skills) if skills else "general professional skills"
        user = (
            f"Generate exactly {count} interview questions for a {job_title} "
            f"with {experience_years} years of experience. Key skills: {skills_str}.\n\n"
            "Include a mix of technical, behavioral, and situational questions.\n"
            "Format the output EXACTLY like this — use numbered labels, no extra separators:\n"
            "Q1: [Question text]\n"
            "A1: [Model answer — can be multiple sentences]\n\n"
            "Q2: [Question text]\n"
            "A2: [Model answer — can be multiple sentences]\n\n"
            "...and so on up to the required count. Do NOT add any intro or outro text."
        )
        # Increase max_tokens so all questions fit in the response
        raw = _chat(system, user, max_tokens=3000)

        questions = []
        current_q = None
        current_a_lines = []

        for line in raw.splitlines():
            stripped = line.strip()
            if not stripped:
                continue

            # Match Q1:, Q2: ... Q99:
            q_match = re.match(r'^Q\d+:\s*(.*)', stripped)
            a_match = re.match(r'^A\d+:\s*(.*)', stripped)

            if q_match:
                # Save previous pair if exists
                if current_q and current_a_lines:
                    questions.append({
                        "question": current_q,
                        "answer": " ".join(current_a_lines).strip()
                    })
                current_q = q_match.group(1).strip()
                current_a_lines = []
            elif a_match:
                current_a_lines.append(a_match.group(1).strip())
            elif current_a_lines is not None and current_q:
                # Continuation line of the answer
                current_a_lines.append(stripped)

        # Save the last pair
        if current_q and current_a_lines:
            questions.append({
                "question": current_q,
                "answer": " ".join(current_a_lines).strip()
            })

        return questions[:count]

    @staticmethod
    def evaluate_answer(question: str, user_answer: str, model_answer: str, job_title: str = "") -> dict:
        """
        Compare a user's practice answer against a model answer.
        Returns a score (0-100), strengths, and improvement tips.
        """
        system = (
            "You are an expert interview coach evaluating a candidate's practice answer. "
            "Be honest, constructive, and specific. Always return valid structured output."
        )
        user = (
            f"Interview Question: {question}\n\n"
            f"Model Answer: {model_answer}\n\n"
            f"Candidate's Answer: {user_answer}\n\n"
            "Evaluate the candidate's answer. Format your response EXACTLY as:\n"
            "SCORE: [0-100]\n"
            "STRENGTHS: [1-2 bullet points of what they did well]\n"
            "IMPROVEMENTS: [1-2 specific things to improve]\n"
            "VERDICT: [one sentence overall verdict]"
        )
        raw = _chat(system, user, max_tokens=400)

        result = {"score": 50, "strengths": "", "improvements": "", "verdict": ""}
        current = None
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("SCORE:"):
                try:
                    result["score"] = int(line.replace("SCORE:", "").strip().split()[0])
                except Exception:
                    pass
            elif line.startswith("STRENGTHS:"):
                current = "strengths"
                val = line.replace("STRENGTHS:", "").strip()
                if val:
                    result["strengths"] += val + " "
            elif line.startswith("IMPROVEMENTS:"):
                current = "improvements"
                val = line.replace("IMPROVEMENTS:", "").strip()
                if val:
                    result["improvements"] += val + " "
            elif line.startswith("VERDICT:"):
                current = "verdict"
                result["verdict"] = line.replace("VERDICT:", "").strip()
            elif line and current in ("strengths", "improvements"):
                result[current] += line + " "

        result["strengths"]    = result["strengths"].strip()
        result["improvements"] = result["improvements"].strip()
        return result

    @staticmethod
    def analyze_resume_detailed(resume_text: str, job_description: str) -> dict:
        """
        Perform a detailed ATS analysis with keyword matching and section feedback.
        Returns found/missing keywords, section scores, and improvement suggestions.
        """
        system = (
            "You are an expert ATS (Applicant Tracking System) analyst. "
            "Analyze resumes against job descriptions and provide actionable, structured feedback."
        )
        user = (
            f"Resume Text:\n{resume_text}\n\n"
            f"Job Description:\n{job_description}\n\n"
            "Analyze this resume against the job description. Format your response EXACTLY as:\n"
            "SCORE: [0-100]\n"
            "FOUND_KEYWORDS: [comma-separated list of keywords from JD found in resume]\n"
            "MISSING_KEYWORDS: [comma-separated list of important JD keywords missing from resume]\n"
            "SECTION_SCORES: summary=[0-100], experience=[0-100], skills=[0-100], education=[0-100]\n"
            "SUGGESTIONS: [3 specific, actionable improvement bullet points]\n"
            "Do NOT add any extra text outside this format."
        )
        raw = _chat(system, user, max_tokens=600)

        result = {
            "score": 0,
            "found_keywords": [],
            "missing_keywords": [],
            "section_scores": {"summary": 0, "experience": 0, "skills": 0, "education": 0},
            "suggestions": []
        }
        suggestions_mode = False
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("SCORE:"):
                try:
                    result["score"] = int(line.replace("SCORE:", "").strip().split()[0])
                except Exception:
                    pass
            elif line.startswith("FOUND_KEYWORDS:"):
                kws = line.replace("FOUND_KEYWORDS:", "").strip()
                result["found_keywords"] = [k.strip() for k in kws.split(",") if k.strip()]
            elif line.startswith("MISSING_KEYWORDS:"):
                kws = line.replace("MISSING_KEYWORDS:", "").strip()
                result["missing_keywords"] = [k.strip() for k in kws.split(",") if k.strip()]
            elif line.startswith("SECTION_SCORES:"):
                parts = line.replace("SECTION_SCORES:", "").strip().split(",")
                for part in parts:
                    if "=" in part:
                        k, v = part.strip().split("=", 1)
                        k = k.strip().lower()
                        if k in result["section_scores"]:
                            try:
                                result["section_scores"][k] = int(v.strip())
                            except Exception:
                                pass
            elif line.startswith("SUGGESTIONS:"):
                suggestions_mode = True
                val = line.replace("SUGGESTIONS:", "").strip()
                if val:
                    result["suggestions"].append(val)
            elif suggestions_mode and line and (line.startswith("-") or line.startswith("•") or (line[0].isdigit() and "." in line[:3])):
                result["suggestions"].append(line.lstrip("-•0123456789. ").strip())

        return result

    @staticmethod
    def estimate_salary(job_title: str, location: str, experience_years: int, skills: list) -> dict:
        """Estimate salary range for a given role, location, and experience level."""
        system = (
            "You are an expert compensation analyst with knowledge of global tech salaries. "
            "Provide realistic, data-driven salary estimates. Always use USD as primary currency."
        )
        skills_str = ", ".join(skills) if skills else "general skills"
        user = (
            f"Estimate the salary range for: {job_title}, {experience_years} years of experience, "
            f"located in {location}. Key skills: {skills_str}.\n\n"
            "Format your response EXACTLY as:\n"
            "MIN: [number in USD, no commas]\n"
            "MID: [number in USD, no commas]\n"
            "MAX: [number in USD, no commas]\n"
            "CURRENCY: USD\n"
            "MARKET_INSIGHT: [2-3 sentences about salary trends for this role]\n"
            "TOP_COMPANIES: [3-4 company names that hire for this role, comma-separated]\n"
            "IN_DEMAND_SKILLS: [4-5 skills that command higher salaries, comma-separated]"
        )
        raw = _chat(system, user, max_tokens=400)
        result = {
            "min": 0, "mid": 0, "max": 0, "currency": "USD",
            "market_insight": "", "top_companies": [], "in_demand_skills": []
        }
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("MIN:"):
                try: result["min"] = int(line.replace("MIN:", "").strip().replace(",", "").split()[0])
                except: pass
            elif line.startswith("MID:"):
                try: result["mid"] = int(line.replace("MID:", "").strip().replace(",", "").split()[0])
                except: pass
            elif line.startswith("MAX:"):
                try: result["max"] = int(line.replace("MAX:", "").strip().replace(",", "").split()[0])
                except: pass
            elif line.startswith("MARKET_INSIGHT:"):
                result["market_insight"] = line.replace("MARKET_INSIGHT:", "").strip()
            elif line.startswith("TOP_COMPANIES:"):
                result["top_companies"] = [c.strip() for c in line.replace("TOP_COMPANIES:", "").split(",") if c.strip()]
            elif line.startswith("IN_DEMAND_SKILLS:"):
                result["in_demand_skills"] = [s.strip() for s in line.replace("IN_DEMAND_SKILLS:", "").split(",") if s.strip()]
        return result

    @staticmethod
    def analyze_skill_gap(current_skills: list, target_role: str, experience_years: int) -> dict:
        """Compare current skills against a target role's requirements."""
        system = (
            "You are an expert career advisor and technical recruiter. "
            "Analyze skill gaps and provide actionable, specific learning recommendations."
        )
        skills_str = ", ".join(current_skills) if current_skills else "no skills listed"
        user = (
            f"Target Role: {target_role} ({experience_years} years experience level)\n"
            f"Current Skills: {skills_str}\n\n"
            "Analyze the skill gap. Format EXACTLY as:\n"
            "MATCH_SCORE: [0-100]\n"
            "REQUIRED_SKILLS: [comma-separated list of 8-10 skills typically required for this role]\n"
            "MATCHING_SKILLS: [comma-separated skills the candidate already has that match]\n"
            "MISSING_SKILLS: [comma-separated skills they need to learn]\n"
            "PRIORITY_LEARN: [top 3 most important missing skills to learn first, comma-separated]\n"
            "TIMELINE: [estimated time to close the gap, e.g. '3-6 months']\n"
            "RESOURCES: [2-3 learning resource suggestions like 'Coursera Python Course', comma-separated]"
        )
        raw = _chat(system, user, max_tokens=500)
        result = {
            "match_score": 0, "required_skills": [], "matching_skills": [],
            "missing_skills": [], "priority_learn": [], "timeline": "", "resources": []
        }
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("MATCH_SCORE:"):
                try: result["match_score"] = int(line.replace("MATCH_SCORE:", "").strip().split()[0])
                except: pass
            elif line.startswith("REQUIRED_SKILLS:"):
                result["required_skills"] = [s.strip() for s in line.replace("REQUIRED_SKILLS:", "").split(",") if s.strip()]
            elif line.startswith("MATCHING_SKILLS:"):
                result["matching_skills"] = [s.strip() for s in line.replace("MATCHING_SKILLS:", "").split(",") if s.strip()]
            elif line.startswith("MISSING_SKILLS:"):
                result["missing_skills"] = [s.strip() for s in line.replace("MISSING_SKILLS:", "").split(",") if s.strip()]
            elif line.startswith("PRIORITY_LEARN:"):
                result["priority_learn"] = [s.strip() for s in line.replace("PRIORITY_LEARN:", "").split(",") if s.strip()]
            elif line.startswith("TIMELINE:"):
                result["timeline"] = line.replace("TIMELINE:", "").strip()
            elif line.startswith("RESOURCES:"):
                result["resources"] = [s.strip() for s in line.replace("RESOURCES:", "").split(",") if s.strip()]
        return result

    @staticmethod
    def check_grammar(text: str) -> dict:
        """Check resume text for grammar issues, weak verbs, and passive voice."""
        system = (
            "You are an expert resume editor. Identify grammar issues, weak action verbs, "
            "passive voice, and unclear phrasing in resume text. Be specific with line references."
        )
        user = (
            f"Review this resume text for issues:\n\n{text}\n\n"
            "Format EXACTLY as:\n"
            "OVERALL_SCORE: [0-100, writing quality score]\n"
            "ISSUES: [list each issue as: TYPE|ORIGINAL TEXT|SUGGESTED FIX, one per line]\n"
            "STRONG_VERBS: [5 strong action verb suggestions for this resume, comma-separated]\n"
            "SUMMARY: [1-2 sentences overall assessment]\n"
            "Mark the end of issues with END_ISSUES."
        )
        raw = _chat(system, user, max_tokens=800)
        result = {"overall_score": 75, "issues": [], "strong_verbs": [], "summary": ""}
        issues_mode = False
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("OVERALL_SCORE:"):
                try: result["overall_score"] = int(line.replace("OVERALL_SCORE:", "").strip().split()[0])
                except: pass
            elif line.startswith("ISSUES:"):
                issues_mode = True
            elif line == "END_ISSUES":
                issues_mode = False
            elif issues_mode and "|" in line:
                parts = line.split("|")
                if len(parts) >= 3:
                    result["issues"].append({
                        "type": parts[0].strip(), "original": parts[1].strip(), "fix": parts[2].strip()
                    })
            elif line.startswith("STRONG_VERBS:"):
                result["strong_verbs"] = [v.strip() for v in line.replace("STRONG_VERBS:", "").split(",") if v.strip()]
            elif line.startswith("SUMMARY:"):
                result["summary"] = line.replace("SUMMARY:", "").strip()
        return result

    @staticmethod
    def translate_resume(resume_data: dict, target_language: str) -> dict:
        """Translate resume text fields into the target language."""
        import json
        system = (
            f"You are a professional translator. Translate the following resume data to {target_language}. "
            "Keep proper nouns (company names, university names, product names) in original language. "
            "Return ONLY valid JSON with the same structure, translated values."
        )
        # Build a simplified text-only version for translation
        translatable = {
            "summary": resume_data.get("personal_info", {}).get("summary", ""),
            "experience_descriptions": [
                {"position": e.get("position", ""), "description": e.get("description", "")}
                for e in resume_data.get("experience", [])
            ],
            "skills_soft": resume_data.get("skills", {}).get("soft", []),
        }
        user = f"Translate to {target_language}. Return ONLY JSON:\n{json.dumps(translatable, ensure_ascii=False)}"
        raw = _chat(system, user, max_tokens=1500)
        try:
            import re
            json_match = re.search(r'\{.*\}', raw, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return translatable
