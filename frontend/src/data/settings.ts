import type {
    TeamMember,
    AutomationRule,
    IntegrationApp,
    ActiveSession,
    DeveloperSettings,
    BillingPlan,
    LegalPageContent,
    LandingContent,
    OnboardingStep,
    OnboardingTip
} from '@/types/settings';

export const mockTeamMembers: TeamMember[] = [
    { id: '1', name: "Gautam", email: "gautam@example.com", role: "Owner", status: "Active", picture: null },
    { id: '2', name: "Sarah Chen", email: "sarah@example.com", role: "Admin", status: "Active", picture: null },
    { id: '3', name: "Alex Riv", email: "alex@example.com", role: "Member", status: "Pending", picture: null },
];

export const mockRules: AutomationRule[] = [
    { id: '1', name: "Auto-archive Newsletters", trigger: "Category equals 'Newsletter'", action: "Archive & Mark as Read", active: true },
    { id: '2', name: "Notify for Invoices", trigger: "Body contains 'Invoice' OR 'Receipt'", action: "Send Push & Slack", active: true },
    { id: '3', name: "Escalate Client Requests", trigger: "Priority > 80", action: "Move to 'Immediate'", active: false },
];

export const mockIntegrations: IntegrationApp[] = [
    {
        id: "gmail",
        name: "Gmail",
        description: "Primary email service for syncing tasks and drafts.",
        status: "connected",
        icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
        account: "gautam@example.com"
    },
    {
        id: "outlook",
        name: "Outlook",
        description: "Microsoft Office 365 and Exchange integration.",
        status: "available",
        icon: "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg",
    },
    {
        id: "slack",
        name: "Slack",
        description: "Send notifications and summaries to your Slack channels.",
        status: "available",
        icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    },
    {
        id: "notion",
        name: "Notion",
        description: "Sync your email tasks to Notion databases.",
        status: "pro",
        icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
    }
];

export const mockSessions: ActiveSession[] = [
    {
        id: "1",
        device: "MacBook Pro",
        type: "desktop",
        location: "San Francisco, USA",
        browser: "Chrome on macOS",
        lastActive: "Active now",
        isCurrent: true
    },
    {
        id: "2",
        device: "iPhone 15",
        type: "mobile",
        location: "San Francisco, USA",
        browser: "SortMail App",
        lastActive: "2 hours ago",
        isCurrent: false
    },
    {
        id: "3",
        device: "Windows Desktop",
        type: "desktop",
        location: "London, UK",
        browser: "Firefox on Windows",
        lastActive: "3 days ago",
        isCurrent: false
    }
];

export const mockDeveloperSettings: DeveloperSettings = {
    apiKey: "sk_live_51P2u...k9z2",
    webhookUrl: "https://api.sortmail.ai/webhooks/v1",
    sdkVersion: "1.2"
};

export const mockBillingPlan: BillingPlan = {
    name: "SortMail Pro",
    status: "expired",
    features: [
        "Priority email processing",
        "Advanced AI summaries",
        "Custom automation rules"
    ]
};

export const mockPrivacyPolicy: LegalPageContent = {
    title: "Privacy Policy",
    lastUpdated: "February 26, 2026",
    sections: [
        {
            id: 1,
            title: "1. Information We Collect",
            content: "SortMail only accesses the data necessary to provide our services. We use Google OAuth to connect to your Gmail account with read-only permissions. We do not store your emails on our servers permanently; we process them in real-time to generate summaries and tasks.",
            items: ["Email headers (To, From, Subject, Date)", "Email body content (for AI analysis)", "Attachment metadata (filenames and types)"],
            iconName: "Eye"
        },
        {
            id: 2,
            title: "2. How We Protect Your Data",
            content: "Security is at the core of SortMail. All data in transit is encrypted using industry-standard TLS. We use secure session management and multi-factor authentication to ensure only you can access your account.",
            iconName: "Lock"
        },
        {
            id: 3,
            title: "3. AI Processing",
            content: "Our AI features use advanced language models to analyze your emails. This happens in a secure, transient environment. Any data sent to AI providers is done so under strict enterprise privacy agreements that prohibit the storage or use of your data for any other purpose.",
            iconName: "FileText"
        },
        {
            id: 4,
            title: "4. Your Rights",
            content: "You have the right to access, export, or delete your SortMail account data at any time. You can also revoke our access to your Google or Outlook account via their respective security settings pages."
        }
    ]
};

export const mockTermsOfService: LegalPageContent = {
    title: "Terms of Service",
    lastUpdated: "February 26, 2026",
    sections: [
        {
            id: 1,
            title: "1. Acceptance of Terms",
            content: "By accessing or using SortMail, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the service. SortMail provides AI-powered email organization and task management tools.",
            iconName: "Scale"
        },
        {
            id: 2,
            title: "2. Service Usage",
            content: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and any activities that occur under your credentials.",
            items: ["SortMail grants you a limited, non-exclusive, non-transferable license to use our platform for personal or professional email management."],
            iconName: "FileCheck"
        },
        {
            id: 3,
            title: "3. Prohibited Conduct",
            content: "You agree not to:",
            items: [
                "Use the service for any illegal purpose.",
                "Attempt to gain unauthorized access to our systems.",
                "Use the service to generate spam or malicious content.",
                "Reverse engineer or decompile any part of the service."
            ],
            iconName: "AlertCircle"
        },
        {
            id: 4,
            title: "4. Limitation of Liability",
            content: "SortMail is provided 'as is' without warranties of any kind. We are not liable for any damages arising out of your use of the service, including data loss or business interruption."
        }
    ]
};

export const mockLandingContent: LandingContent = {
    trustIndicators: [
        { label: "Read-only OAuth", iconName: "Shield" },
        { label: "No auto-send", iconName: "Eye" },
        { label: "Open source", iconName: "Github" }
    ],
    socialProofInitials: ["SC", "LT", "DT"],
    trustedUserCount: "1,200+"
};

export const mockOnboardingSteps: OnboardingStep[] = [
    {
        id: 1,
        title: "Connect",
        description: "Link your primary work account",
        iconName: "Mail"
    },
    {
        id: 2,
        title: "Personalize",
        description: "Tailor the AI to your workflow",
        iconName: "Sparkles"
    },
    {
        id: 3,
        title: "Ready",
        description: "Quick tour of your new inbox",
        iconName: "BookOpen"
    }
];

export const mockOnboardingTips: OnboardingTip[] = [
    { title: "Dashboard Briefing", description: "Your morning summary of key emails." },
    { title: "Priority Inbox", description: "Automated sorting of urgent vs. regular." },
    { title: "AI Drafts", description: "Ready-to-send replies waiting for you." },
    { title: "Task Extraction", description: "Action items pulled from your threads." }
];
