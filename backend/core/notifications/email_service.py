"""
Email Service
-------------
Handles sending transactional emails.
Currently mocked to log to the terminal for local development.
"""
import logging

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_magic_link(email: str, link: str):
        """
        Sends a magic login link to the user.
        """
        print("\n" + "="*50)
        print(f"📧 [MOCK EMAIL] To: {email}")
        print(f"🔗 Magic Link: {link}")
        print("="*50 + "\n")
        
        # In production, integrate with Resend, SendGrid, etc.
        logger.info(f"Magic link sent to {email}")
        return True

    @staticmethod
    async def send_verification_email(email: str, link: str):
        """
        Sends an email verification link.
        """
        print("\n" + "="*50)
        print(f"📧 [MOCK EMAIL] To: {email}")
        print(f"🔗 Verification Link: {link}")
        print("="*50 + "\n")
        
        logger.info(f"Verification email sent to {email}")
        return True
