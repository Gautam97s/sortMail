"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    Brain,
    Bell,
    Shield,
    CreditCard,
    LayoutGrid,
    AlertTriangle,
    Users,
    Code2,
    Sliders,
    Blocks,
    Lock,
    Smartphone,
    Laptop,
} from "lucide-react";

const SETTINGS_NAV = [
    { label: "Overview", href: "/settings", icon: LayoutGrid },
    { label: "Accounts", href: "/settings/accounts", icon: User },
    { label: "Team", href: "/settings/team", icon: Users },
    { label: "AI & Intelligence", href: "/settings/ai", icon: Brain },
    { label: "Automation Rules", href: "/settings/rules", icon: Sliders },
    { label: "Integrations", href: "/settings/integrations", icon: Blocks },
    { label: "Developer", href: "/settings/developer", icon: Code2 },
    { label: "Security (2FA)", href: "/settings/security/2fa", icon: Smartphone },
    { label: "Active Sessions", href: "/settings/security/sessions", icon: Laptop },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
    { label: "Privacy & Data", href: "/settings/privacy", icon: Shield },
    { label: "Billing & Plans", href: "/settings/billing", icon: CreditCard },
    { label: "Danger Zone", href: "/settings/danger", icon: AlertTriangle },
];

export default function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide gap-1 border-b md:border-b-0 border-border-light/50 md:w-64 shrink-0">
            {SETTINGS_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap
                            ${isActive
                                ? "bg-accent/10 text-accent font-medium"
                                : "text-muted hover:bg-paper-mid hover:text-ink"
                            }
                        `}
                    >
                        <Icon size={16} className={isActive ? "text-accent" : "text-muted"} />
                        <span className="text-[13px]">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
