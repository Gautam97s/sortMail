# Team B — Intelligence Layer
# First Week TODO List

## Day 1-2: LLM Setup
- [ ] Get Gemini API key from Google AI Studio
- [ ] Or get OpenAI API key if using GPT
- [ ] Add to `.env`: `GEMINI_API_KEY=xxx`
- [ ] Test basic API call:
  ```python
  import google.generativeai as genai
  genai.configure(api_key="xxx")
  model = genai.GenerativeModel('gemini-pro')
  response = model.generate_content("Hello!")
  print(response.text)
  ```

## Day 3-4: Summarizer
- [ ] Edit `backend/core/intelligence/summarizer.py`
- [ ] Create prompt template for email summarization
- [ ] Implement `summarize_thread()`:
  - Input: list of email messages
  - Output: 2-3 sentence summary
- [ ] Test with mock EmailThreadV1

## Day 5-6: Intent Classifier
- [ ] Edit `backend/core/intelligence/intent_classifier.py`
- [ ] Define intent categories:
  - `ACTION_REQUIRED` - needs response
  - `FYI` - informational only
  - `SCHEDULING` - calendar/meeting related
  - `URGENT` - time-sensitive
- [ ] Implement keyword matching (fast, no LLM)
- [ ] Add LLM fallback for ambiguous cases

## Day 7: Integration
- [ ] Wire up `email_intel.py` main function
- [ ] Test: EmailThreadV1 → ThreadIntelV1
- [ ] Prepare for Week 2 demo

---

## Key Files to Edit

```
backend/core/intelligence/
├── email_intel.py        ← EDIT: Main orchestrator
├── summarizer.py         ← EDIT: LLM summarization
├── intent_classifier.py  ← EDIT: Intent detection
├── deadline_extractor.py ← Week 2
├── entity_extractor.py   ← Week 2
└── attachment_intel.py   ← Week 3
```

---

## Contract Reference

**Input** (from Team A):
```python
class EmailThreadV1(BaseModel):
    thread_id: str
    subject: str
    participants: List[str]
    messages: List[EmailMessage]
    has_attachments: bool
```

**Output** (to Team C):
```python
class ThreadIntelV1(BaseModel):
    thread_id: str
    summary: str                  # ← YOU CREATE
    intent: IntentType            # ← YOU CLASSIFY
    urgency_score: int            # ← YOU CALCULATE (0-100)
    main_ask: Optional[str]       # ← YOU EXTRACT
    extracted_deadlines: List[...] 
    attachment_summaries: List[...]
```

---

## Prompt Templates

```python
# Summarization prompt
SUMMARIZE_PROMPT = """
You are an executive assistant. Summarize this email thread in 2-3 sentences.
Focus on:
- What is the main topic?
- What action is needed (if any)?
- Any deadlines mentioned?

Email thread:
{thread_content}

Summary:
"""

# Intent prompt
INTENT_PROMPT = """
Classify this email's intent as one of:
- ACTION_REQUIRED: Needs a response or action
- FYI: Informational, no action needed
- SCHEDULING: About meetings/calendar
- URGENT: Time-sensitive matter

Email: {email_content}

Intent:
"""
```

---

## Test Commands

```bash
# Test summarizer
python -c "
from core.intelligence.summarizer import summarize_thread
from contracts.mocks import create_mock_thread
result = summarize_thread(create_mock_thread())
print(result)
"

# Run tests
pytest tests/test_contracts.py -v
```

---

## Environment Variables Needed

```env
# .env file
GEMINI_API_KEY=your-gemini-api-key
# OR
OPENAI_API_KEY=your-openai-api-key
LLM_PROVIDER=gemini  # or "openai"
```
