# Team D — Frontend
# First Week TODO List

## Day 1-2: Setup & Landing
- [ ] Run `cd frontend && npm install`
- [ ] Run `npm run dev`
- [ ] Verify http://localhost:3000 works
- [ ] Review existing components:
  - `src/app/page.tsx` (landing)
  - `src/app/login/page.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/Header.tsx`
- [ ] Improve landing page styling

## Day 3-4: Dashboard Polish
- [ ] Review `src/app/dashboard/page.tsx`
- [ ] Connect to mock data (already set up)
- [ ] Improve `PriorityList.tsx` styling
- [ ] Improve `WaitingFor.tsx` styling
- [ ] Add click handlers (console.log for now)

## Day 5-6: Thread List Page
- [ ] Create `src/app/dashboard/threads/page.tsx`
- [ ] Create `src/components/thread/ThreadList.tsx`
- [ ] Create `src/components/thread/ThreadCard.tsx`
- [ ] Use mock data for now
- [ ] Add navigation: click thread → /thread/[id]

## Day 7: Integration Prep
- [ ] Review `src/utils/api.ts`
- [ ] Test API calls to backend (when ready)
- [ ] Prepare for Week 2 demo

---

## Key Files to Create/Edit

```
frontend/src/
├── app/
│   ├── page.tsx              ← POLISH
│   ├── login/page.tsx        ← POLISH
│   └── dashboard/
│       ├── page.tsx          ← POLISH
│       └── threads/
│           └── page.tsx      ← CREATE
│
├── components/
│   ├── dashboard/
│   │   ├── PriorityList.tsx  ← POLISH
│   │   ├── WaitingFor.tsx    ← POLISH
│   │   └── QuickStats.tsx    ← POLISH
│   └── thread/               ← CREATE FOLDER
│       ├── ThreadList.tsx    ← CREATE
│       └── ThreadCard.tsx    ← CREATE
│
└── styles/
    └── globals.css           ← ADD STYLES
```

---

## Component Templates

### ThreadCard.tsx
```tsx
'use client';

interface ThreadCardProps {
  threadId: string;
  subject: string;
  summary: string;
  intent: string;
  urgencyScore: number;
  lastUpdated: string;
  hasAttachments: boolean;
}

export function ThreadCard({ 
  threadId, 
  subject, 
  summary,
  intent,
  urgencyScore,
  hasAttachments 
}: ThreadCardProps) {
  return (
    <div className="card hover:border-primary/50 cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-text">{subject}</h3>
        <span className={`priority-badge priority-${intent.toLowerCase()}`}>
          {intent}
        </span>
      </div>
      <p className="text-sm text-text-muted mb-2">{summary}</p>
      <div className="flex items-center gap-2 text-xs text-text-muted">
        {hasAttachments && <span>📎</span>}
        <span>Urgency: {urgencyScore}/100</span>
      </div>
    </div>
  );
}
```

### ThreadList.tsx
```tsx
'use client';

import { ThreadCard } from './ThreadCard';

// Mock data - replace with API call
const MOCK_THREADS = [
  {
    threadId: '1',
    subject: 'Contract Review - Final Terms',
    summary: 'Sarah sent the final contract, needs approval by Friday.',
    intent: 'ACTION_REQUIRED',
    urgencyScore: 85,
    lastUpdated: '2 hours ago',
    hasAttachments: true,
  },
  // ... more threads
];

export function ThreadList() {
  return (
    <div className="space-y-3">
      {MOCK_THREADS.map((thread) => (
        <ThreadCard key={thread.threadId} {...thread} />
      ))}
    </div>
  );
}
```

---

## Design System Reference

```css
/* Colors - use these CSS variables */
--color-primary: #6366f1;
--color-priority-high: #ef4444;
--color-priority-medium: #f59e0b;
--color-priority-low: #22c55e;
--color-bg: #0f172a;
--color-surface: #1e293b;
--color-text: #f8fafc;
--color-text-muted: #94a3b8;
```

---

## Test Commands

```bash
# Start dev server
cd frontend
npm run dev

# Build check
npm run build

# Lint
npm run lint
```

---

## Week 2 Preview

Next week you'll connect to real API:

```tsx
// src/utils/api.ts
export async function getThreads() {
  const response = await apiClient.get('/threads');
  return response.data;
}

// src/app/dashboard/threads/page.tsx
const threads = await getThreads();
```
