"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

const SETTINGS_NAV = [
    { label: "Overview", href: "/settings", icon: "dashboard" },
    { label: "Accounts", href: "/settings/accounts", icon: "person" },
    { label: "Team", href: "/settings/team", icon: "group" },
    { label: "AI & Intelligence", href: "/settings/ai", icon: "psychology" },
    { label: "Automation Rules", href: "/settings/rules", icon: "rule" },
    { label: "Integrations", href: "/settings/integrations", icon: "extension" },
    { label: "Developer", href: "/settings/developer", icon: "code" },
    { label: "Security (2FA)", href: "/settings/security/2fa", icon: "stay_current_portrait" },
    { label: "Active Sessions", href: "/settings/security/sessions", icon: "laptop" },
    { label: "Notifications", href: "/settings/notifications", icon: "notifications" },
    { label: "Privacy & Data", href: "/settings/privacy", icon: "shield" },
    { label: "Billing & Plans", href: "/settings/billing", icon: "credit_card" },
    { label: "Danger Zone", href: "/settings/danger", icon: "warning" },
];

export default function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide gap-1 md:w-64 shrink-0 pr-4">
            {SETTINGS_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap
                            ${isActive
                                ? "bg-primary-fixed/30 text-primary font-bold shadow-sm"
                                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                            }
                        `}
                    >
                        <MaterialSymbol 
                            icon={item.icon} 
                            filled={isActive} 
                            className={`text-xl ${isActive ? "text-primary" : "text-outline"}`} 
                        />
                        <span className="text-[13px] font-headline">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
