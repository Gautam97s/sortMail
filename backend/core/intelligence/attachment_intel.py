"""
Attachment Intelligence
-----------------------
Analyzes document attachments (PDF, DOCX, PPTX) and produces deep analysis.
Uses Gemini Flash to extract summary, key points, action items, financial data, etc.
"""

import json
import logging
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.attachment import Attachment, AttachmentStatus
import re
import asyncio
from core.intelligence.llama_engine import _call_llama
from core.intelligence.prompts import (
    ATTACHMENT_ANALYSIS_SYSTEM_PROMPT,
    ATTACHMENT_ANALYSIS_USER_PROMPT_TEMPLATE,
)


logger = logging.getLogger(__name__)


async def analyze_attachment(attachment_id: str, db: AsyncSession) -> Optional[Dict[str, Any]]:
    """
    Extracts text from a downloaded attachment and runs a unified Gemini Flash analysis.
    Saves the result to attachment.intel_json and returns the JSON payload.
    """
    stmt = select(Attachment).where(Attachment.id == attachment_id)
    result = await db.execute(stmt)
    attachment = result.scalars().first()
    
    if not attachment:
        logger.warning(f"Attachment {attachment_id} not found.")
        return None
        
    if not attachment.storage_path:
        logger.warning(f"Attachment {attachment_id} has no storage path yet.")
        return None

    # 1. Extract Document Text
    text = await _extract_text(attachment)
    if not text or len(text.strip()) < 10:
        logger.debug(f"Attachment {attachment_id} text extraction failed or insufficient.")
        attachment.status = AttachmentStatus.FAILED
        await db.commit()
        return None
        
    # Keep the strongest signal: head + tail, capped to a compact window.
    if len(text) > 25000:
        safe_text = text[:20000] + "\n\n[...truncated...]\n\n" + text[-5000:]
    else:
        safe_text = text

    # 2. Build Deep Analysis Prompt
    prompt = ATTACHMENT_ANALYSIS_USER_PROMPT_TEMPLATE.format(document_text=safe_text)

    messages = [
        {"role": "system", "content": ATTACHMENT_ANALYSIS_SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]
    
    for attempt in range(4):
        try:
            raw_json = await _call_llama(messages, max_tokens=1600, temperature=0.1, operation="attachment_intel")
            
            # Clean up any potential markdown fences
            raw_json = re.sub(r'^```(?:json)?\s*|\s*```$', '', raw_json.strip(), flags=re.DOTALL).strip()
            # Extract JSON if there's surrounding text
            json_match = re.search(r'\{.*\}', raw_json, re.DOTALL)
            if json_match:
                raw_json = json_match.group(0)
            
            intel_dict = json.loads(raw_json)
            
            # 3. Save back to DB
            attachment.intel_json = intel_dict
            attachment.extracted_text = safe_text[:2000] # Save a snippet
            attachment.status = AttachmentStatus.INDEXED
            
            await db.commit()
            logger.info(f"✅ Generated intelligence for attachment {attachment.id}")
            return intel_dict
            
        except json.JSONDecodeError as e:
            logger.warning(f"Attachment analysis JSON parse failed attempt {attempt+1}/4 for {attachment.id}: {e}")
            if attempt == 3:
                break
            await asyncio.sleep(1)
            
        except Exception as e:
            error_str = str(e)
            logger.warning(f"Attachment analysis failed attempt {attempt+1}/4 for {attachment.id}: {error_str}")
            
            if "429" in error_str or "rate" in error_str.lower():
                wait = 2 ** attempt
                logger.warning(f"Rate limited — waiting {wait}s")
                await asyncio.sleep(wait)
                continue
                
            if attempt == 3:
                break
            await asyncio.sleep(1)
            
    # Fallback / Failure
    logger.error(f"Failed to analyze attachment {attachment.id} after 4 attempts.")
    attachment.status = AttachmentStatus.FAILED
    await db.commit()
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Text Extractors
# ─────────────────────────────────────────────────────────────────────────────

async def _extract_text(attachment: Attachment) -> str:
    """Route text extraction based on mime type or extension."""
    try:
        mime = (attachment.mime_type or "").lower()
        path = attachment.storage_path
        
        if mime == "application/pdf" or path.endswith(".pdf"):
            return _extract_pdf_text(path)
        elif "wordprocessing" in mime or path.endswith(".docx"):
            return _extract_docx_text(path)
        elif "presentation" in mime or path.endswith(".pptx"):
            return _extract_pptx_text(path)
        elif mime.startswith("text/"):
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        else:
            logger.debug(f"Unsupported mime type for text extraction: {mime}")
            return ""
    except Exception as e:
        logger.error(f"Text extraction failed for {attachment.id}: {e}")
        return ""


def _extract_pdf_text(path: str) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(path)
        return "\\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    except ImportError:
        logger.warning("pypdf not installed.")
        return ""
    except Exception as e:
        logger.warning(f"Failed parsing PDF {path}: {e}")
        return ""


def _extract_docx_text(path: str) -> str:
    try:
        from docx import Document
        doc = Document(path)
        return "\\n".join([p.text for p in doc.paragraphs if p.text])
    except ImportError:
        logger.warning("python-docx not installed.")
        return ""
    except Exception as e:
        logger.warning(f"Failed parsing DOCX {path}: {e}")
        return ""


def _extract_pptx_text(path: str) -> str:
    try:
        from pptx import Presentation
        prs = Presentation(path)
        text = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text:
                    text.append(shape.text)
        return "\\n".join(text)
    except ImportError:
        logger.warning("python-pptx not installed.")
        return ""
    except Exception as e:
        logger.warning(f"Failed parsing PPTX {path}: {e}")
        return ""
