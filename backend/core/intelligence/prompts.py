"""
Compact AI prompt templates for SortMail.
"""

THREAD_INTEL_SYSTEM_PROMPT = "Email triage engine. Return JSON only."

THREAD_INTEL_USER_PROMPT_TEMPLATE = """Analyze this thread and return one JSON object.

Subject: {subject}
Participants: {participants}

Messages:
{messages}

Rules:
- Use only evidence in the thread.
- If the thread is promotional, newsletter, social, passive notification, webinar, event invite, or visit-site style mail: set should_create_reply=false and should_create_tasks=false.
- Only set should_create_reply=true when a reply is clearly expected.
- Only set should_create_tasks=true when there is a concrete action owned by YOU.
- Draft generation is on_request_only.

Return JSON with these top-level fields:
summary, intent, urgency_score, urgency_reason, sentiment, main_ask, decision_needed,
should_create_reply, should_create_tasks, is_promotional, is_subscription, workflow_reason,
suggested_draft, key_points, action_items, entities, tags, topics, follow_up_needed, reply_deadline, meeting_detected.

urgency_score must be an integer from 0 to 100, where 0 is not urgent and 100 is critical.

Suggested intent values:
ACTION_REQUIRED, QUESTION, SCHEDULING, URGENT, FYI, NEWSLETTER, SOCIAL, PROMOTIONAL, OTHER, UNKNOWN

Suggested action item fields:
title, description, owner, due_date, priority, task_type
"""

DRAFT_REPLY_SYSTEM_PROMPT = "Write concise professional replies. Return plain text only."

DRAFT_REPLY_USER_PROMPT_TEMPLATE = """Write a reply for this thread.

Tone: {tone}
Instruction: {instruction}

Thread:
{thread_context}

Constraints:
- body only
- no subject
- no markdown
- 80-180 words
- if no reply is needed, return NO_REPLY_NEEDED
"""

FREEFORM_DRAFT_SYSTEM_PROMPT = "Write concise professional outbound emails. Return plain text only."

FREEFORM_DRAFT_USER_PROMPT_TEMPLATE = """Write an outbound email.

To: {recipient_context}
Subject: {subject}
Tone: {tone}
Instruction: {instruction}

Constraints:
- body only
- no markdown
- 80-180 words
- clear purpose in the first two lines
"""

ATTACHMENT_ANALYSIS_SYSTEM_PROMPT = "Document extraction engine. Return JSON only."

ATTACHMENT_ANALYSIS_USER_PROMPT_TEMPLATE = """Analyze this document text and return one JSON object.

Document:
{document_text}

Return JSON fields:
document_type, summary, key_points, action_items, financial_amounts,
dates_and_deadlines, risk_flags, parties_involved, confidence
"""

CHAT_SYSTEM_PROMPT = "You are the SortMail assistant. Be concise, practical, and professional. Use only the provided context."
