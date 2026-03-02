from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.dependencies import get_current_user
from models.user import User

router = APIRouter()

# Return mock settings to replace the frontend constants for now.
# In a full implementation, these would be fetched from the database.
@router.get("", response_model=Dict[str, Any])
async def get_settings(current_user: User = Depends(get_current_user)):
    return {
        "rules": [
            {
                "id": "rule_1",
                "name": "Receipts & Invoices",
                "description": "Auto-archive receipts and forward high-value invoices to accounting.",
                "condition": "Subject contains 'receipt', 'invoice', or 'order confirmation'",
                "actions": ["Archive", "Label: Finance"],
                "isActive": True,
                "matches": 142
            },
            {
                "id": "rule_2",
                "name": "VIP Clients",
                "description": "Mark emails from key accounts as urgent and notify in Slack.",
                "condition": "Sender domain in ['bigclient.com', 'important.io']",
                "actions": ["Mark Urgent", "Add to Tasks", "Notify Slack"],
                "isActive": True,
                "matches": 38
            },
            {
                "id": "rule_3",
                "name": "Newsletter Triage",
                "description": "Read later and skip inbox for promotional content.",
                "condition": "Is Newsletter or Promotional",
                "actions": ["Skip Inbox", "Label: Read Later"],
                "isActive": False,
                "matches": 0
            }
        ],
        "sessions": [
            {
                "id": "sess_1",
                "device": "MacBook Pro 16\"",
                "browser": "Chrome 122.0.0",
                "location": "San Francisco, CA, US",
                "ip": "192.168.1.1",
                "lastActive": "2 minutes ago",
                "isCurrent": True
            },
            {
                "id": "sess_2",
                "device": "iPhone 15 Pro",
                "browser": "SortMail iOS App",
                "location": "San Francisco, CA, US",
                "ip": "100.64.0.1",
                "lastActive": "3 hours ago",
                "isCurrent": False
            }
        ],
        "integrations": [
            {
                "id": "slack",
                "name": "Slack",
                "description": "Send alerts for urgent emails and create channels for important threads.",
                "icon": "/icons/slack.svg",
                "status": "connected",
                "account": "sortmail-team.slack.com"
            },
            {
                "id": "notion",
                "name": "Notion",
                "description": "Automatically create pages from meeting notes and organize extracted tasks.",
                "icon": "/icons/notion.svg",
                "status": "disconnected"
            },
            {
                "id": "linear",
                "name": "Linear",
                "description": "Convert incoming bug reports into issues linked to customer emails.",
                "icon": "/icons/linear.svg",
                "status": "pro"
            },
            {
                "id": "zapier",
                "name": "Zapier",
                "description": "Connect SortMail to 5000+ other apps to build custom workflows.",
                "icon": "/icons/zapier.svg",
                "status": "disconnected"
            }
        ],
        "teamMembers": [
            {
                "id": "usr_1",
                "name": "Alex Mercer",
                "email": "alex@sortmail.io",
                "role": "Owner",
                "status": "Active",
                "lastActive": "Just now"
            },
            {
                "id": "usr_2",
                "name": "Sarah Chen",
                "email": "sarah@sortmail.io",
                "role": "Admin",
                "status": "Active",
                "lastActive": "2 hours ago"
            },
            {
                "id": "usr_3",
                "name": "Marcus Johnson",
                "email": "marcus@sortmail.io",
                "role": "Member",
                "status": "Pending",
                "lastActive": "Never"
            }
        ]
    }
