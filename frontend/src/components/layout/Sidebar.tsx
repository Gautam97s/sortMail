"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavCounts } from "@/hooks/useThreads";
import { useUser } from "@/hooks/useUser";
import { RELEASE, isFeatureEnabled } from "@/lib/release";

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function Sidebar({ collapsed = false, onToggle, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: counts } = useNavCounts();
    const { data: user } = useUser();

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { label: "Inbox", href: "/inbox", icon: "inbox", badge: counts?.inbox },
        { label: "Tasks", href: "/tasks", icon: "checklist" },
        { label: "Contacts", href: "/contacts", icon: "group" },
        { label: "Drafts", href: "/drafts", icon: "edit_document", badge: counts?.drafts },
        { label: "Follow-ups", href: "/followups", icon: "schedule" },
    ];

    const utilityItems = [
        { label: "Search", href: "/search", icon: "search", enabled: isFeatureEnabled('semantic_search', user) },
        { label: "Notifications", href: "/notifications", icon: "notifications", enabled: isFeatureEnabled('notifications_center', user) },
        { label: "Settings", href: "/settings", icon: "settings" },
    ];

    return (
        <aside
            className={`
                flex flex-col bg-surface-container-low border-r border-outline-variant/15 shrink-0 overflow-hidden z-50 transition-all duration-300
                ${isOpen ? 'drawer open' : 'drawer'} md:relative md:translate-x-0
            `}
            style={{ width: collapsed ? '80px' : 'var(--sb-w)' }}
        >
            {/* Logo Section */}
            <div className="px-4 pt-5 shrink-0">
                <Link href="/dashboard" className={`flex items-center gap-3 rounded-[28px] ${collapsed ? 'justify-center px-3 py-2' : 'px-4 py-3'} bg-white/70 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all`}>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary shadow-[0_14px_28px_-12px_rgba(0,91,191,0.55)]">
                        <MaterialSymbol icon="mail" filled className="text-xl" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="font-headline font-bold text-lg leading-tight tracking-tight text-on-surface truncate">
                                SortMail AI
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.28em] text-outline font-bold truncate">
                                Intelligent Canvas
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Compose Button */}
            <div className="px-4 mb-5 mt-5">
                <button 
                    className={`
                        w-full py-3.5 rounded-[18px] bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-sm flex items-center justify-center gap-2 tonal-shadow hover:opacity-95 transition-all
                        ${collapsed ? 'px-0' : 'px-4'}
                    `}
                    title="Compose Email"
                >
                    <MaterialSymbol icon="add" className="text-xl" />
                    {!collapsed && <span>Compose</span>}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-hide font-medium">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const itemClassName = isActive
                        ? "bg-white text-primary shadow-sm ring-1 ring-primary/10 border-r-4 border-primary"
                        : "text-on-surface-variant hover:text-primary hover:bg-white/60";
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                if (window.innerWidth < 768 && onClose) {
                                    onClose();
                                }
                            }}
                            className={`
                                flex items-center gap-4 py-3 rounded-r-full transition-all duration-200 group
                                ${itemClassName}
                                ${collapsed ? "justify-center px-0 rounded-r-[999px]" : "pl-5 pr-4"}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <MaterialSymbol 
                                icon={item.icon} 
                                filled={isActive} 
                                className={`text-[22px] transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} 
                            />
                            {!collapsed && (
                                <>
                                    <span className={`flex-1 text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                        {item.label}
                                    </span>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}

                {/* Utility Section */}
                {!collapsed && (
                    <div className="mt-8 pt-4 border-t border-outline-variant/15 px-4">
                        <div className="text-[10px] font-bold text-outline uppercase tracking-[0.28em] mb-4">
                            Utilities
                        </div>
                        <div className="space-y-1">
                            {utilityItems.filter((item) => item.enabled !== false).map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-4 py-2.5 px-4 rounded-2xl text-on-surface-variant hover:text-primary hover:bg-white/60 transition-colors group"
                                >
                                    <MaterialSymbol icon={item.icon} className="text-[20px] group-hover:text-primary" />
                                    <span className="text-sm font-semibold">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mt-auto border-t border-outline-variant/15 flex flex-col gap-2">
                {!collapsed && (
                    <>
                        <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-primary tracking-[0.24em] uppercase bg-primary-fixed/30 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            AI Synchronized
                        </div>
                        <div className="text-[10px] font-mono text-outline uppercase tracking-wider px-1">
                            v{RELEASE.version} · {RELEASE.channel}
                        </div>
                    </>
                )}
                
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={`w-full flex items-center gap-3 py-2.5 rounded-2xl text-on-surface-variant hover:text-on-surface hover:bg-white/60 transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : 'px-3'}`}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <MaterialSymbol icon={collapsed ? "chevron_right" : "chevron_left"} className="text-xl" />
                        {!collapsed && <span className="text-sm font-semibold">Minimize</span>}
                    </button>
                )}
            </div>
        </aside>
    );
}
