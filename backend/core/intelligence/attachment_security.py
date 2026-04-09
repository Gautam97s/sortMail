"""
Attachment security checks and text sanitization helpers.
"""

from __future__ import annotations

import os
import re
from typing import Any

BLOCKED_EXTENSIONS = {
    ".exe", ".dll", ".bat", ".cmd", ".msi", ".js", ".jse", ".vbs", ".vbe", ".wsf", ".ps1", ".psm1",
    ".scr", ".com", ".jar", ".pif", ".reg", ".hta", ".apk", ".bin", ".sh",
}

BLOCKED_MIME_KEYWORDS = (
    "application/x-msdownload",
    "application/x-dosexec",
    "application/x-executable",
    "application/x-sh",
    "application/x-bat",
    "application/x-msi",
    "application/javascript",
    "text/javascript",
)

PROMPT_INJECTION_PATTERNS = (
    r"ignore\s+previous\s+instructions",
    r"disregard\s+all\s+rules",
    r"reveal\s+system\s+prompt",
    r"print\s+all\s+secrets",
    r"exfiltrate",
    r"developer\s+mode",
    r"jailbreak",
    r"override\s+policy",
)

MALICIOUS_CODE_PATTERNS = (
    r"powershell\s+-enc",
    r"cmd\.exe\s+/c",
    r"frombase64string",
    r"eval\(",
    r"exec\(",
    r"<script",
    r"javascript:",
    r"document\.cookie",
    r"wget\s+http",
    r"curl\s+http",
)


def precheck_attachment_metadata(filename: str, mime_type: str, size_bytes: int, max_size_mb: int) -> tuple[bool, str]:
    """Validate attachment metadata before any parsing or model calls."""
    ext = os.path.splitext((filename or "").strip().lower())[1]
    mime = (mime_type or "").strip().lower()

    if ext in BLOCKED_EXTENSIONS:
        return False, f"blocked_executable_extension:{ext}"

    if any(keyword in mime for keyword in BLOCKED_MIME_KEYWORDS):
        return False, f"blocked_executable_mime:{mime}"

    max_size_bytes = max(int(max_size_mb), 1) * 1024 * 1024
    if int(size_bytes or 0) > max_size_bytes:
        return False, f"attachment_too_large:{size_bytes}"

    return True, "ok"


def scan_text_security(text: str) -> dict[str, Any]:
    """Detect prompt injection and obvious code-malware indicators in extracted text."""
    value = text or ""
    lowered = value.lower()

    prompt_hits = [p for p in PROMPT_INJECTION_PATTERNS if re.search(p, lowered)]
    code_hits = [p for p in MALICIOUS_CODE_PATTERNS if re.search(p, lowered)]

    return {
        "has_prompt_injection_signals": bool(prompt_hits),
        "has_malicious_code_signals": bool(code_hits),
        "prompt_injection_hits": prompt_hits[:8],
        "malicious_code_hits": code_hits[:8],
    }


def sanitize_text_for_llm(text: str) -> str:
    """Redact high-risk instruction lines so model treats docs as data, not instructions."""
    lines = (text or "").splitlines()
    sanitized: list[str] = []
    for line in lines:
        low = line.lower().strip()
        if any(re.search(pattern, low) for pattern in PROMPT_INJECTION_PATTERNS):
            sanitized.append("[REDACTED_POTENTIAL_PROMPT_INJECTION]")
            continue
        sanitized.append(line)
    return "\n".join(sanitized)


def text_quality_stats(text: str) -> dict[str, Any]:
    value = text or ""
    alpha = sum(1 for ch in value if ch.isalpha())
    length = len(value)
    alpha_ratio = (alpha / length) if length else 0.0
    return {
        "length": length,
        "alpha_ratio": round(alpha_ratio, 4),
        "looks_like_text": length > 32 and alpha_ratio > 0.2,
    }
