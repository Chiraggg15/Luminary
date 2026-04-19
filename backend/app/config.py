"""
Configuration
-------------
All app settings are loaded from environment variables (via .env file).
Never hard-code secrets — use .env for local development.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env into os.environ


class Config:
    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Tokens expire after 24h

    # ── Database ─────────────────────────────────────────────────────────────
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    DB_NAME = os.getenv("DB_NAME", "ai_resume_db")

    # ── Gemini AI ────────────────────────────────────────────────────────────
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # ── Google OAuth ─────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

    # ── App Settings ─────────────────────────────────────────────────────────
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
    TESTING = False
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # ── Mail Settings ────────────────────────────────────────────────────────
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", os.getenv("MAIL_USERNAME", ""))
