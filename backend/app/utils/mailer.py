"""
Mailer Utility
--------------
Handles sending emails using Flask-Mail.
"""

from flask import current_app, render_template_string
from flask_mail import Message
from app import mail

def send_reset_password_email(user_email, user_name, reset_link):
    """Send a password reset link to the user's email."""
    subject = "Reset Your Password - Luminary"
    
    # Simple HTML template for the email
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #18181b;">Hello {user_name},</h2>
        <p style="color: #52525b; line-height: 1.6;">
            We received a request to reset your password for your Luminary account. 
            Click the button below to set a new password. This link will expire in 1 hour.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
               Reset Password
            </a>
        </div>
        <p style="color: #71717a; font-size: 0.875rem;">
            If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 20px 0;">
        <p style="color: #a1a1aa; font-size: 0.75rem; text-align: center;">
            &copy; 2024 Luminary AI Resume Builder. All rights reserved.
        </p>
    </div>
    """

    msg = Message(
        subject=subject,
        recipients=[user_email],
        html=html_content
    )

    try:
        mail.send(msg)
        return True
    except Exception as e:
        print(f"ERROR sending email: {str(e)}")
        # In development, we can fallback to printing the link if mail fails
        if current_app.debug:
            print(f"\n--- DEBUG: RESET LINK ---\n{reset_link}\n------------------------\n")
        return False
