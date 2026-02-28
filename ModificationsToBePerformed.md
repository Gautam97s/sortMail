# SortMail — Complete Page Inventory (Production-Grade)

**Total: 122 screens** (70 pages + 42 modals + 10 transactional emails)

---

## PUBLIC ROUTES (Unauthenticated) — 9 pages

| # | Route | Status | Priority |
|---|-------|--------|----------|
| 1 | `/` | ✅ Built | P0 |
| 2 | `/login` | ✅ Built | P0 |
| 3 | `/magic-link-sent` | ✅ Built | P1 |
| 4 | `/callback` | ✅ Built | P0 |
| 5 | `/onboarding` | ✅ Built | P0 |
| 6 | `/privacy` | ✅ Built | P2 |
| 7 | `/terms` | ✅ Built | P2 |
| 8 | `/404` | ✅ Built | P2 |
| 9 | `/500` | ✅ Built | P2 |

---

## AUTHENTICATED ROUTES — App Shell — 32 pages

### Core App (P0-P1)
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 10 | `/dashboard` | ✅ Built | P0 |
| 11 | `/inbox` | ✅ Built | P0 |
| 12 | `/inbox/[threadId]` | ✅ Built | P0 |
| 13 | `/tasks` | ✅ Built | P1 |
| 14 | `/drafts` | ✅ Built | P1 |
| 15 | `/followups` | ✅ Built | P1 |
| 16 | `/calendar` | ✅ Built | P1 |
| 17 | `/search` | ✅ Built | P2 |
| 18 | `/contacts` | ✅ Built | P2 |
| 19 | `/contacts/[email]` | ✅ Built | P2 |
| 20 | `/notifications` | ✅ Built | P2 |

### Settings (P1-P2)
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 21 | `/settings` (→ `/settings/accounts`) | ✅ Built | P1 |
| 22 | `/settings/accounts` | ✅ Built | P1 |
| 23 | `/settings/ai` | ✅ Built | P1 |
| 24 | `/settings/notifications` | ✅ Built | P1 |
| 25 | `/settings/notifications/channels` | 📋 Planned | P2 |
| 26 | `/settings/privacy` | ✅ Built | P1 |
| 27 | `/settings/billing` | ✅ Built | P1 |
| 28 | `/settings/danger` | ✅ Built | P2 |
| 29 | `/settings/security/2fa` | ✅ Built | P2 |
| 30 | `/settings/security/sessions` | ✅ Built | P2 |
| 31 | `/settings/team` | ✅ Built | P2 |
| 32 | `/settings/developer` | ✅ Built | P2 |
| 33 | `/settings/rules` | ✅ Built | P2 |
| 34 | `/settings/integrations` | ✅ Built | P2 |

### Auth & Security
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 36 | `/auth/2fa` | ✅ Built | P2 |
| 37 | `/reset-password` | ✅ Built | P2 |
| 38 | `/account-locked` | ✅ Built | P2 |
| 39 | `/verify-email` | ✅ Built | P1 |

### Billing & Upgrade
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 40 | `/upgrade` | ✅ Built | P1 |
| 41 | `/checkout/success` | ✅ Built | P1 |
| 42 | `/checkout/cancel` | ✅ Built | P1 |
| 43 | `/billing/payment-failed` | ✅ Built | P1 |
| 44 | `/billing/expired` | ✅ Built | P1 |

### Help & Support
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 45 | `/help` | ✅ Built | P2 |
| 46 | `/help/[articleSlug]` | ✅ Built | P2 |
| 47 | `/support` | ✅ Built | P2 |
| 48 | `/status` (public) | ✅ Built | P2 |
| 49 | `/changelog` | ✅ Built | P2 |

### Team / Collaboration
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 50 | `/workspace` | ✅ Built | P2 |
| 51 | `/tasks/shared` | ✅ Built | P2 |
| 52 | `/invite/[token]` (public) | ✅ Built | P2 |
| 53 | `/onboarding/workspace` | ✅ Built | P2 |
| 54 | `/onboarding/import` | ✅ Built | P2 |

### Growth & Misc
| # | Route | Status | Priority |
|---|-------|--------|----------|
| 55 | `/referral` | ✅ Built | P3 |
| 56 | `/credits` | ✅ Built | P2 |
| 57 | `/partners` | ✅ Built | P3 |
| 58 | `/unsubscribe/[token]` (public) | ✅ Built | P2 |
| 59 | `/come-back` (re-engagement) | ✅ Built | P3 |
| 60 | `/maintenance` | ✅ Built | P2 |

---

## ADMIN ROUTES — 20 pages

| # | Route | Status | Priority |
|---|-------|--------|----------|
| 60 | `/admin` | ✅ Built | P1 |
| 61 | `/admin/users` | ✅ Built | P1 |
| 62 | `/admin/users/[userId]` | ✅ Built | P1 |
| 63 | `/admin/emails/activity` | ✅ Built | P2 |
| 64 | `/admin/ai/usage` | ✅ Built | P1 |
| 65 | `/admin/analytics` | ✅ Built | P2 |
| 66 | `/admin/security` | ✅ Built | P1 |
| 67 | `/admin/system` | ✅ Built | P1 |
| 68 | `/admin/alerts` | ✅ Built | P1 |
| 69 | `/admin/billing` | ✅ Built | P2 |
| 70 | `/admin/invites` | ✅ Built | P2 |
| 71 | `/admin/announcements` | ✅ Built | P2 |
| 72 | `/admin/support` | ✅ Built | P2 |
| 73 | `/admin/security/audit/export` | ✅ Built | P2 |
| 74 | `/admin/compliance` | ✅ Built | P2 |
| 75 | `/admin/templates` | ✅ Built | P2 |
| 76 | `/admin/experiments` | ✅ Built | P2 |
| 77 | `/admin/rules/global` | ✅ Built | P3 |
| 78 | `/admin/credits` | ✅ Built | P2 |
| 79 | `/admin/credits/transactions` | ✅ Built | P2 |

---

## MODALS (No URL change) — 22 modals

| # | Modal | Trigger | Status |
|---|-------|---------|--------|
| M1 | Task Create | Quick action / thread action bar | ✅ Built |
| M2 | Task Detail/Edit | Task card click | ✅ Built |
| M3 | Snooze/Reminder | Follow-up row action | ✅ Built |
| M4 | Confirm Calendar Slot | Calendar suggestion "Add" | 📋 Planned |
| M5 | Confirm Action | Destructive actions | ✅ Built |
| M6 | Attachment Preview | Attachment chip "View" | 📋 Planned |
| M7 | Draft Preview | Inbox quick action "Draft" | 📋 Planned |
| M8 | Keyboard Shortcuts | `?` key or help menu | 📋 Planned |
| M9 | Admin Impersonate Warning | Before impersonation | 📋 Planned |
| M10 | Feature Flag | Admin system config toggle | 📋 Planned |
| M11 | 2FA Enable | Settings security | 📋 Planned |
| M12 | Revoke Session | Session management | 📋 Planned |
| M13 | Assign Email | Team plan, assign to member | 📋 Planned |
| M14 | Label/Tag | Create + apply custom labels | 📋 Planned |
| M15 | Export Data | GDPR data export | 📋 Planned |
| M16 | API Key Create | Developer settings | 📋 Planned |
| M17 | Webhook Test | Webhook config test | 📋 Planned |
| M18 | Announcement Preview | Admin preview before publish | 📋 Planned |
| M19 | Invite Team Members | Bulk email + role select | 📋 Planned |
| M20 | Snooze Until Custom | Date + time picker with TZ | 📋 Planned |
| M21 | Create Rule | Settings > Rules | 📋 Planned |
| M22 | Edit Translation | Admin > System | 📋 Planned |

---

## TRANSACTIONAL EMAILS — 10 emails

| # | Email | Trigger | Status |
|---|-------|---------|--------|
| T1 | Welcome | First login | 📋 Planned |
| T2 | Magic Link | Auth request | 📋 Planned |
| T3 | Daily Briefing | Opt-in digest | 📋 Planned |
| T4 | Follow-up Reminder | When push unavailable | 📋 Planned |
| T5 | Weekly Summary | Tasks/emails/AI stats | 📋 Planned |
| T6 | Payment Failed | Stripe webhook | 📋 Planned |
| T7 | Trial Expiring | 3 days before | 📋 Planned |
| T8 | Account Deletion Confirmation | After deletion | 📋 Planned |
| T9 | Team Invite | Workspace invite | 📋 Planned |
| T10 | Security Alert | New device login | 📋 Planned |

---

## EDGE CASE STATES — 12 states

| # | State | Where Shown | Status |
|---|-------|-------------|--------|
| S1 | Inbox Zero | Inbox page | 📋 Planned |
| S2 | First Sync in Progress | First login | 📋 Planned |
| S3 | Provider Sync Error | Inline banner | 📋 Planned |
| S4 | AI Quota Exceeded | Upgrade prompt | 📋 Planned |
| S5 | Offline Banner | Persistent top bar | 📋 Planned |
| S6 | New Version Available | Refresh prompt banner | 📋 Planned |
| S7 | Maintenance Mode | `/maintenance` page | 📋 Planned |
| S8 | Rate Limit | Cooldown page | 📋 Planned |
| S9 | Impersonate Mode Banner | Admin impersonating | 📋 Planned |
| S10 | Workspace Suspended | Account suspended | 📋 Planned |
| S11 | Data Export in Progress | Async export status | 📋 Planned |
| S12 | Incomplete Onboarding | Dashboard banner | 📋 Planned |

---

## IMPLEMENTATION PHASES

### Phase 1: MVP (Completed ✅)
- Landing page
- Login page
- Dashboard
- Inbox list
- Thread detail

### Phase 2: Core Features (Completed ✅)
- Tasks page
- Draft copilot
- Follow-ups tracker
- Calendar suggestions
- Settings (accounts, AI, notifications)

### Phase 3: Growth & Monetization
- Billing & upgrade flow
- Team collaboration
- Integrations hub
- Admin dashboard

### Phase 4: Scale & Polish
- Help center
- Advanced admin tools
- Compliance features
- All edge states
