# Team C — Workflow Layer
# First Week TODO List

## Day 1-2: Priority Engine
- [ ] Review `backend/core/workflow/priority_engine.py`
- [ ] Define scoring formula:
  ```
  score = urgency_base + intent_boost + deadline_boost + vip_boost
  ```
- [ ] Implement `calculate_priority()`:
  - Input: ThreadIntelV1
  - Output: PriorityLevel + score + explanation
- [ ] Add explainability strings

## Day 3-4: Task Generator
- [ ] Review `backend/core/workflow/task_generator.py`
- [ ] Implement `generate_tasks()`:
  - Input: ThreadIntelV1
  - Output: List[TaskDTOv1]
- [ ] Map intent → task type:
  - ACTION_REQUIRED → "reply"
  - SCHEDULING → "schedule"
  - Has attachment → "review"
- [ ] Include deadline from intel

## Day 5-6: Basic Draft Stub
- [ ] Review `backend/core/workflow/draft_engine.py`
- [ ] Create stub that returns mock draft
- [ ] Define tone options: brief, normal, formal
- [ ] Placeholder detection: `[text in brackets]`

## Day 7: Integration
- [ ] Wire up task creation flow
- [ ] Test: ThreadIntelV1 → TaskDTOv1
- [ ] Prepare for Week 2 demo

---

## Key Files to Edit

```
backend/core/workflow/
├── priority_engine.py    ← EDIT: Priority calculation
├── task_generator.py     ← EDIT: Task creation
├── draft_engine.py       ← STUB: Week 4
├── followup_tracker.py   ← Week 4
└── reminder_service.py   ← Week 5
```

---

## Contract Reference

**Input** (from Team B):
```python
class ThreadIntelV1(BaseModel):
    thread_id: str
    summary: str
    intent: IntentType
    urgency_score: int
    main_ask: Optional[str]
    extracted_deadlines: List[ExtractedDeadline]
```

**Output** (to Team D):
```python
class TaskDTOv1(BaseModel):
    task_id: str
    thread_id: str
    title: str              # ← YOU GENERATE
    priority: PriorityLevel # ← YOU CALCULATE
    priority_score: int     # ← YOU CALCULATE
    priority_explanation: str # ← YOU EXPLAIN
    effort: EffortLevel     # ← YOU ESTIMATE
    deadline: Optional[datetime]
    suggested_action: str   # "Reply", "Review", "Schedule"
```

---

## Priority Scoring Rules

```python
# Base scores by urgency
URGENCY_BASE = {
    "high": 60,
    "medium": 40,
    "low": 20
}

# Intent boosts
INTENT_BOOST = {
    IntentType.URGENT: 30,
    IntentType.ACTION_REQUIRED: 20,
    IntentType.SCHEDULING: 10,
    IntentType.FYI: 0
}

# Deadline boost (if < 24h = +20, < 48h = +10)
# VIP boost (if sender in VIP list = +15)

# Final levels
# 70+ = DO_NOW
# 40-69 = DO_TODAY
# <40 = CAN_WAIT
```

---

## Explanation Templates

```python
EXPLANATIONS = {
    "vip_urgent": "VIP sender + urgent deadline",
    "urgent_deadline": "Deadline within 24 hours",
    "action_required": "Requires your response",
    "has_attachment": "Attachment needs review",
    "scheduling": "Scheduling request",
    "fyi": "Informational only"
}
```

---

## Test Commands

```bash
# Test priority
python -c "
from core.workflow.priority_engine import calculate_priority
from contracts.mocks import create_mock_thread_intel
result = calculate_priority(create_mock_thread_intel())
print(f'Score: {result.priority_score}, Level: {result.priority}')
print(f'Reason: {result.priority_explanation}')
"

# Run tests
pytest tests/ -v
```
