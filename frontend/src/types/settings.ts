export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Member';
    status: 'Active' | 'Pending';
    picture: string | null;
}

export interface AutomationRule {
    id: string;
    name: string;
    trigger: string;
    action: string;
    active: boolean;
}

export interface IntegrationApp {
    id: string;
    name: string;
    description: string;
    status: 'connected' | 'available' | 'pro';
    icon: string;
    account?: string;
}

export interface ActiveSession {
    id: string;
    device: string;
    type: 'desktop' | 'mobile' | 'tablet';
    location: string;
    browser: string;
    lastActive: string;
    isCurrent: boolean;
}

export interface DeveloperSettings {
    apiKey: string;
    webhookUrl?: string;
    sdkVersion: string;
}

export interface BillingPlan {
    name: string;
    price?: string;
    status: 'active' | 'expired' | 'trial';
    features: string[];
}

export interface LegalSection {
    id: number;
    title: string;
    content: string;
    items?: string[];
    iconName?: string;
}

export interface LegalPageContent {
    title: string;
    lastUpdated: string;
    sections: LegalSection[];
}

export interface LandingTrustIndicator {
    label: string;
    iconName: string;
}

export interface LandingContent {
    trustIndicators: LandingTrustIndicator[];
    socialProofInitials: string[];
    trustedUserCount: string;
}

export interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    iconName: string;
}

export interface OnboardingTip {
    title: string;
    description: string;
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    plan: 'Free' | 'Pro' | 'Enterprise';
    initials: string;
}

export interface NavCounts {
    inbox: number;
    tasks: number;
    followups: number;
}

export interface AppStatus {
    isOnline: boolean;
    lastSync: string;
}
