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
        { label: "Tasks", href: "/tasks", icon: "checklist", badge: counts?.tasks_due },
        { label: "Contacts", href: "/contacts", icon: "group" },
        { label: "Drafts", href: "/drafts", icon: "edit_document", badge: counts?.drafts },
        { label: "Follow-ups", href: "/followups", icon: "schedule" },
    ];

    const utilityItems = [
        { label: "Bin", href: "/bin", icon: "delete_sweep" },
        { label: "Notifications", href: "/notifications", icon: "notifications", enabled: isFeatureEnabled('notifications_center', user) },
        { label: "Settings", href: "/settings", icon: "settings" },
    ];

    return (
        <aside
            className={`
                flex flex-col bg-surface-container-low border-r border-outline-variant/15 shrink-0 overflow-hidden z-50 transition-all duration-300
                ${isOpen ? 'drawer open' : 'drawer'} md:relative md:translate-x-0
            `}
            style={{ width: collapsed ? '72px' : 'var(--sb-w)' }}
        >
            {/* Logo Section */}
            <div className="px-2.5 pt-2.5 shrink-0">
                <Link href="/dashboard" className={`flex items-center gap-2.5 rounded-2xl ${collapsed ? 'justify-center px-2 py-1.5' : 'px-2.5 py-2'} bg-white/70 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all`}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary shadow-[0_10px_20px_-12px_rgba(0,91,191,0.55)]">
                        <MaterialSymbol icon="mail" filled className="text-xl" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="font-headline font-bold text-[15px] leading-tight tracking-tight text-on-surface truncate">
                                SortMail AI
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.22em] text-outline font-bold truncate">
                                Intelligent Canvas
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Compose Button */}
            <div className="px-2.5 mb-3 mt-3">
                <Link
                    href="/drafts"
                    className={`
                        w-full py-2 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-xs flex items-center justify-center gap-1.5 tonal-shadow hover:opacity-95 transition-all
                        ${collapsed ? 'px-0' : 'px-4'}
                    `}
                    title="Compose Email"
                >
                    <MaterialSymbol icon="add" className="text-xl" />
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
                                ${collapsed ? "justify-center px-0 rounded-r-[999px]" : "pl-3.5 pr-2.5"}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <MaterialSymbol 
                                icon={item.icon} 
                                filled={isActive} 
                                className={`text-[20px] transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`} 
                            />
                            {!collapsed && (
                                <>
                                    <span className={`flex-1 text-[11px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                        {item.label}
                                    </span>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
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
                    <div className="mt-4 pt-2.5 border-t border-outline-variant/15 px-2.5">
                        <div className="text-[9px] font-bold text-outline uppercase tracking-[0.22em] mb-3">
                            Utilities
                        </div>
                        <div className="space-y-1">
                            {utilityItems.filter((item) => item.enabled !== false).map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-white/60 transition-colors group"
                                >
                                    <MaterialSymbol icon={item.icon} className="text-[20px] group-hover:text-primary" />
                                    <span className="text-xs font-semibold">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="p-2.5 mt-auto border-t border-outline-variant/15 flex flex-col gap-1.5">
                {!collapsed && (
                    <>
                        <div className="flex items-center gap-2 px-2.5 py-1 text-[9px] font-bold text-primary tracking-[0.2em] uppercase bg-primary-fixed/30 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            AI Synchronized
                        </div>
                        <div className="text-[9px] font-mono text-outline uppercase tracking-wider px-1">
                            v{RELEASE.version} · {RELEASE.channel}
                        </div>
                    </>
                )}
                
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={`w-full flex items-center gap-2 py-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/60 transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : 'px-2.5'}`}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <MaterialSymbol icon={collapsed ? "chevron_right" : "chevron_left"} className="text-lg" />
                        {!collapsed && <span className="text-[13px] font-semibold">Minimize</span>}
                    </button>
                )}
            </div>
        </aside>
    );
}
