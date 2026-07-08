"""
WSGI Entry Point for Production (Render/Gunicorn)
--------------------------------------------------
Render uses: gunicorn wsgi:app
"""

from app import create_app

app = create_app()
