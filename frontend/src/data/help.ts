import type { HelpCategory, HelpArticle } from '@/types/help';

export const mockHelpCategories: HelpCategory[] = [
    {
        title: "Getting Started",
        description: "Everything you need to set up your account and connect your first inbox.",
        iconName: "Compass",
        articles: [
            { title: "Connecting your Gmail account", slug: "connecting-gmail" },
            { title: "Dashboard overview", slug: "dashboard-overview" },
            { title: "First steps with AI summaries", slug: "ai-summaries-intro" }
        ]
    },
    {
        title: "AI & Intelligence",
        description: "How SortMail uses Gemini to summarize, draft, and organize your work.",
        iconName: "Sparkles",
        articles: [
            { title: "Customizing summary tone", slug: "summary-tone" },
            { title: "Smart task extraction", slug: "task-extraction" },
            { title: "Training your personal AI", slug: "ai-training" }
        ]
    },
    {
        title: "Security & Privacy",
        description: "Understand how we protect your data and manage your account security.",
        iconName: "Shield",
        articles: [
            { title: "Two-factor authentication", slug: "setup-2fa" },
            { title: "Data encryption standards", slug: "data-encryption" },
            { title: "Revoking access", slug: "revoke-access" }
        ]
    },
    {
        title: "Billing & Plans",
        description: "Manage your subscription, invoices, and upgrade options.",
        iconName: "CreditCard",
        articles: [
            { title: "Subscription tiers", slug: "subscription-plans" },
            { title: "Payment methods", slug: "payment-methods" },
            { title: "Refund policy", slug: "refund-policy" }
        ]
    }
];

export const mockHelpArticles: Record<string, HelpArticle> = {
    'connecting-gmail': {
        slug: 'connecting-gmail',
        title: 'Connecting your Gmail account',
        categoryTitle: 'Getting Started',
        readTime: '5 min read',
        lastUpdated: 'February 27, 2026',
        content: `
            <p>SortMail uses advanced AI models to transform your inbox into an organized workspace. Connecting your account is the first step toward reclaiming your productivity.</p>
            
            <h2>Prerequisites</h2>
            <ul>
                <li>A Google or Outlook account</li>
                <li>Write access to your primary email address</li>
            </ul>

            <h2>Connection Steps</h2>
            <ol>
                <li>Navigate to the <strong>Integrations</strong> page in your settings.</li>
                <li>Click the <strong>Connect Account</strong> button next to your provider.</li>
                <li>Follow the OAuth flow and grant SortMail the required permissions.</li>
            </ol>

            <blockquote>
                SortMail only requests read-only permissions by default. We never send emails on your behalf without your explicit confirmation.
            </blockquote>

            <h2>Common Issues</h2>
            <p>If you encounter a connection error, ensure that you haven't exceeded the maximum number of connected apps in your provider settings.</p>
        `,
        relatedArticles: ['dashboard-overview', 'ai-summaries-intro']
    }
};
