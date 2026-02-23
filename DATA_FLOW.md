# SortMail — Data Flow Reference

> Step-by-step data flow for every major operation in the system.  
> Use this when debugging or building new features.

---

## 1. User Opens Inbox

```
1. Browser navigates to /inbox
2. InboxPage mounts (Client Component)
3. useThreads() fires React Query:
     GET /api/threads
     → FastAPI: SELECT * FROM threads WHERE user_id=X ORDER BY last_email_at DESC LIMIT 20
     → Response: [{thread_id, subject, summary, intent, urgency_score, participants, ...}]
     → React Query caches result for 5 minutes
4. ThreadRows render instantly (<200ms total)

Concurrently:
5. useSmartSync() fires:
     GET /api/emails/sync/status
     → FastAPI: SELECT last_sync_at FROM connected_accounts WHERE user_id=X
     → Response: {needs_sync: true/false, status, last_sync_at}
     
   If needs_sync=true:
     POST /api/emails/sync  (returns immediately — 200ms)
     → FastAPI: BackgroundTasks.add_task(sync_user_emails, user_id)
     → Frontend starts polling GET /api/emails/sync/status every 3s
     → When status=idle: queryClient.invalidateQueries(['threads'])
     → React Query refetches threads from DB with new data
     
6. useRealtimeEvents() opens SSE:
     GET /api/events/stream (EventSource, keep-alive)
     → FastAPI subscribes to Redis channel: user:{id}:events
     → Sends heartbeat every 25s
```

---

## 2. Incremental Gmail Sync (Background)

```
1. sync_service.sync_user_emails(user_id) runs in background
2. Load connected_account from DB
   → If no last_history_id: run initial_sync (fetch 90 days)
   → If has last_history_id: run incremental_sync
   
3. Incremental sync:
   GET history.list(startHistoryId=last_history_id)
   → Returns changed thread IDs
   
   For each changed thread_id:
     GET threads.get(id=thread_id, format='full')
     → Parse MIME (recursive: text/plain preferred, text/html fallback)
     → Extract messages, attachments
     → Convert to EmailThreadV1 contract
     → _save_thread(user_id, contract)
       → UPSERT threads table
       → UPSERT messages table
       → Store attachments if downloadable
   
4. Update last_history_id in connected_accounts
5. Update sync_status = 'idle', last_sync_at = now()

After each _save_thread():
6. asyncio.create_task(_run_intel_safe(thread_id, user_id))
   → Opens new DB session
   → Calls process_thread_intelligence()
```

---

## 3. AI Intelligence Pipeline (Per Thread)

```
pipeline.process_thread_intelligence(thread_id, user_id, db):

1. Load Thread from DB (check intel_generated_at < 24h — skip if fresh)
2. Load Messages from DB ordered by sent_at

3. gemini_engine.run_intelligence(
     thread_id, subject, participants, messages[:10]
   )
   → Build XML prompt (max 2000 chars per message body)
   → POST to Gemini 2.0 Flash API
   → Parse JSON response
   → Returns: {summary, intent, urgency_score, action_items, 
               calendar_events, entities, expected_reply_by, ...}

4. Module extraction (all pure functions, no API calls):
   summarizer.extract_summary(intel_json)          → string
   summarizer.extract_key_points(intel_json)       → list
   summarizer.extract_suggested_action(intel_json) → string|None
   
   intent_classifier.extract_intent(intel_json)         → (intent, score)
   intent_classifier.extract_priority_level(intel_json) → string
   intent_classifier.should_follow_up(intel_json)       → (bool, date|None)
   
   deadline_extractor.extract_deadlines(intel_json)     → list[{title, date, ...}]
   
   entity_extractor.extract_entities(intel_json)        → {people, companies, ...}
   entity_extractor.extract_action_items(intel_json)    → list[{title, due_date, ...}]

5. Save to Thread:
   UPDATE threads SET 
     summary=..., intent=..., urgency_score=..., 
     intel_json=..., intel_generated_at=now()

6. Auto-create Tasks:
   For each action_item (no duplicates by thread_id + title):
     INSERT INTO tasks (user_id, source_thread_id, title, priority_level, ...)

7. SSE notification:
   Redis PUBLISH user:{id}:events {type: "intel_ready", thread_id, summary, ...}
   → Frontend EventSource receives event
   → queryClient.invalidateQueries(['threads'])  — inbox silently updates
   → queryClient.invalidateQueries(['thread', thread_id])  — detail page updates
```

---

## 4. User Clicks Thread

```
1. Browser navigates to /inbox/{thread_id}
2. ThreadDetailPage mounts (Client Component, 'use client')
3. useThreadDetail(thread_id) fires React Query:
     GET /api/threads/{thread_id}
     → FastAPI:
       SELECT Thread WHERE id=thread_id AND user_id=current_user.id
       SELECT Message WHERE thread_id=thread_id ORDER BY sent_at
       Extract intel from thread.intel_json
     → Response: {thread: EmailThreadV1, intel: ThreadIntelV1|null, tasks: [...], draft: null}
4. Thread detail renders: messages + AI sidebar (if intel exists)
```

---

## 5. SSE Real-Time Event Loop

```
Backend (events.py):
  GET /api/events/stream
  → Redis pubsub.subscribe(f"user:{user_id}:events")
  → Loop:
      message = await pubsub.get_message(timeout=1.0)
      if message: yield f"event: {type}\ndata: {json}\n\n"
      else: yield "event: heartbeat\ndata: {}\n\n"
           sleep(25s)

Frontend (useRealtimeEvents.ts):
  const es = new EventSource('/api/events/stream', {withCredentials: true})
  
  es.addEventListener('intel_ready', (e) => {
    queryClient.invalidateQueries(['threads'])
    queryClient.invalidateQueries(['thread', data.thread_id])
  })
  
  es.addEventListener('new_emails', (e) => {
    queryClient.invalidateQueries(['threads'])
  })
  
  // EventSource auto-reconnects on disconnect
```

---

## 6. Error Scenarios & Handling

| Scenario | What happens |
|----------|-------------|
| Gmail historyId expired (>7 days) | `sync_service` catches 404, falls back to full sync |
| Gemini API down | `gemini_engine` returns `_fallback_intel(subject)` — minimal safe data |
| DB thread not found in pipeline | `pipeline` logs warning, returns None — no crash |
| Redis not available (SSE) | `events.py` sends heartbeat-only mode — no events but also no error |
| Auth token expired | Gmail API throws error → `sync_service` logs, marks account `sync_status=failed` |
| Duplicate task creation | `pipeline._create_task()` checks title+thread_id uniqueness before INSERT |
