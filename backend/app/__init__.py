"""
Flask Application Factory
--------------------------
Initializes the Flask app with all extensions and registers blueprints.
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from pymongo import MongoClient
from .config import Config

# Global extensions/clients
mongo_client = None
db = None
mail = Mail()


def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── Extensions ──────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins (restrict in production)
    JWTManager(app)
    mail.init_app(app)

    # ── MongoDB Connection ───────────────────────────────────────────────────
    global mongo_client, db
    mongo_client = MongoClient(app.config["MONGO_URI"])
    db = mongo_client[app.config["DB_NAME"]]

    # ── Register Blueprints (Route Modules) ──────────────────────────────────
    from .routes.auth import auth_bp
    from .routes.resume import resume_bp
    from .routes.ai import ai_bp
    from .routes.pdf import pdf_bp
    from .routes.interview import interview_bp

    app.register_blueprint(auth_bp,   url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(ai_bp,     url_prefix="/api/ai")
    app.register_blueprint(pdf_bp,    url_prefix="/api/pdf")
    app.register_blueprint(interview_bp, url_prefix="/api/interview")

    # ── Health Check Route ───────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "AI Resume Generator API is running"}

    return app
