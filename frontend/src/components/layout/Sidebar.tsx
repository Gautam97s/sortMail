"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavCounts } from "@/hooks/useThreads";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
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
    const { data: notificationCount } = useNotificationUnreadCount();
    const { data: user } = useUser();

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { label: "Inbox", href: "/inbox", icon: "inbox", badge: counts?.inbox },
        { label: "Tasks", href: "/tasks", icon: "checklist", badge: counts?.tasks_due },
        { label: "Contacts", href: "/contacts", icon: "group" },
        { label: "Drafts", href: "/drafts", icon: "edit_document", badge: counts?.drafts },
        { label: "Follow-ups", href: "/followups", icon: "schedule" },
    ];

    const utilityItems = [
        { label: "Bin", href: "/bin", icon: "delete_sweep" },
        { label: "Notifications", href: "/notifications", icon: "notifications", badge: notificationCount?.unread, enabled: isFeatureEnabled('notifications_center', user) },
        { label: "Settings", href: "/settings", icon: "settings" },
    ];

    return (
        <aside
            className={`
                flex flex-col bg-surface-container-low border-r border-outline-variant/15 shrink-0 overflow-hidden z-50 transition-all duration-300
                ${isOpen ? 'drawer open' : 'drawer'} md:relative md:translate-x-0
            `}
            style={{ width: collapsed ? '64px' : 'var(--sb-w)' }}
        >
            {/* Logo Section */}
            <div className="px-2 pt-2 shrink-0">
                <Link href="/dashboard" className={`flex items-center gap-2 rounded-2xl ${collapsed ? 'justify-center px-1.5 py-1.5' : 'px-2 py-1.5'} bg-white/70 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary shadow-[0_10px_20px_-12px_rgba(0,91,191,0.55)]">
                        <MaterialSymbol icon="mail" filled className="text-lg" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="font-headline font-bold text-sm leading-tight tracking-tight text-on-surface truncate">
                                SortMail AI
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.14em] text-outline font-semibold truncate">
                                Intelligent Canvas
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Compose Button */}
            <div className="px-2 mb-2 mt-2">
                <Link
                    href="/drafts"
                    className={`
                        w-full py-1.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-[11px] flex items-center justify-center gap-1 tonal-shadow hover:opacity-95 transition-all
                        ${collapsed ? 'px-0' : 'px-3'}
                    `}
                    title="Compose Email"
                >
                    <MaterialSymbol icon="add" className="text-lg" />
                    {!collapsed && <span>Compose</span>}
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto scrollbar-hide font-medium">
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
                                flex items-center gap-2.5 py-2 rounded-r-full transition-all duration-200 group
                                ${itemClassName}
                                ${collapsed ? "justify-center px-0 rounded-r-[999px]" : "pl-3 pr-2"}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <MaterialSymbol 
                                icon={item.icon} 
                                filled={isActive} 
                                className={`text-[18px] transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} 
                            />
                            {!collapsed && (
                                <>
                                    <span className={`flex-1 text-xs ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                        {item.label}
                                    </span>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
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
                    <div className="mt-3 pt-2 border-t border-outline-variant/15 px-2">
                        <div className="text-[10px] font-semibold text-outline uppercase tracking-[0.14em] mb-2.5">
                            Utilities
                        </div>
                        <div className="space-y-1">
                            {utilityItems.filter((item) => item.enabled !== false).map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-2 py-1.5 px-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/60 transition-colors group"
                                >
                                    <MaterialSymbol icon={item.icon} className="text-[18px] group-hover:text-primary" />
                                    <span className="text-[11px] font-semibold flex-1">{item.label}</span>
                                    {'badge' in item && item.badge && item.badge > 0 && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="p-2 mt-auto border-t border-outline-variant/15 flex flex-col gap-1">
                {!collapsed && (
                    <>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold text-primary tracking-[0.14em] uppercase bg-primary-fixed/30 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            AI Synchronized
                        </div>
                        <div className="text-[10px] font-mono text-outline uppercase tracking-[0.1em] px-1">
                            v{RELEASE.version} · {RELEASE.channel}
                        </div>
                    </>
                )}
                
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={`w-full flex items-center gap-2 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/60 transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : 'px-2'}`}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <MaterialSymbol icon={collapsed ? "chevron_right" : "chevron_left"} className="text-base" />
                        {!collapsed && <span className="text-xs font-semibold">Minimize</span>}
                    </button>
                )}
            </div>
        </aside>
    );
}
