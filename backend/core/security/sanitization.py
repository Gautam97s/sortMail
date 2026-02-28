"""
Sanitization Utilities
----------------------
Security functions for cleaning untrusted input.
"""

import bleach

# Allowed tags for email rendering (safe subset)
ALLOWED_TAGS = [
    'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 
    'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 
    'strong', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul', 'u'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'], # Removed style
    '*': ['class'], # Removed style
}

def sanitize_email_html(html_content: str) -> str:
    """
    Sanitize HTML content from emails to prevent XSS.
    """
    if not html_content:
        return ""
        
    return bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True,  # Strip unsafe tags instead of escaping
        strip_comments=True
    )
