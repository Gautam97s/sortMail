"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Inbox,
    Search,
    Users,
    CheckSquare,
    FileEdit,
    Clock,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    LifeBuoy,
    Share2,
    Zap,
    ShieldCheck
} from "lucide-react";
import { mockUserProfile, mockNavCounts, mockAppStatus } from "@/data/user";

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const user = mockUserProfile;
    const counts = mockNavCounts;
    const status = mockAppStatus;

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Inbox", href: "/inbox", icon: Inbox, badge: counts.inbox },
        { label: "Search", href: "/search", icon: Search },
        { label: "Contacts", href: "/contacts", icon: Users },
        { label: "Tasks", href: "/tasks", icon: CheckSquare, badge: counts.tasks },
        { label: "Drafts", href: "/drafts", icon: FileEdit },
        { label: "Follow-ups", href: "/followups", icon: Clock, badge: counts.followups },
        { label: "Calendar", href: "/calendar", icon: Calendar },
    ];

    return (
        <aside
            className={`
                flex flex-col bg-paper-deep text-ink transition-all duration-300 ease-in-out shrink-0 overflow-hidden border-r border-border
                ${isOpen ? 'drawer open' : 'drawer'} md:relative md:translate-x-0
            `}
            style={{ width: collapsed ? 'var(--sidebar-col)' : 'var(--sidebar-w)' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-[56px] shrink-0 border-b border-border">
                <div className="w-8 h-8 rounded bg-accent flex items-center justify-center shrink-0 shadow-sm">
                    <span className="font-display italic text-white text-xl translate-y-[-1px]">S</span>
                </div>
                {!collapsed && (
                    <span className="font-display italic text-xl text-ink tracking-wide">
                        SortMail
                    </span>
                )}
            </div>

            {/* Main Nav */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;

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
                                flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group
                    ${isActive ? "bg-accent/10 text-accent" : "text-muted hover:bg-paper-mid hover:text-ink"}
                    ${collapsed ? "justify-center" : ""}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={18} strokeWidth={2} className="shrink-0" />
                            {!collapsed && (
                                <>
                                    <span className="flex-1 text-[13px] font-medium tracking-wide truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-accent/20 text-accent min-w-[20px] text-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="py-4 px-3 space-y-1 mt-auto border-t border-border bg-paper-mid/30">
                {/* Connection Status */}
                {!collapsed && (
                    <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-success tracking-wide uppercase">
                        <span className={`w-1.5 h-1.5 rounded-full bg-success ${status.isOnline ? 'animate-pulse' : 'opacity-50'}`}></span>
                        {status.isOnline ? 'Online' : 'Offline'}
                    </div>
                )}

                {[
                    { label: "Settings", href: "/settings", icon: Settings },
                    { label: "Support", href: "/support", icon: LifeBuoy }
                ].map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;
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
                                flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group
                                ${isActive ? "bg-accent/10 text-accent" : "text-muted hover:bg-paper-mid hover:text-ink"}
                                ${collapsed ? "justify-center" : ""}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={18} strokeWidth={2} className="shrink-0" />
                            {!collapsed && (
                                <span className="flex-1 text-[13px] font-medium tracking-wide truncate">{item.label}</span>
                            )}
                        </Link>
                    );
                })}

                {/* Collapse Toggle */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted/50 hover:text-ink hover:bg-paper-mid transition-colors cursor-pointer"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        {!collapsed && <span className="text-[13px] font-medium">Collapse</span>}
                    </button>
                )}

                {/* User Profile & Sign Out */}
                {!collapsed && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-paper-deep border border-border shrink-0 relative">
                            {/* Avatar placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink/80">{user.initials}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-ink truncate">{user.firstName} {user.lastName}</div>
                            <div className="text-[10px] text-muted truncate">{user.plan} Plan</div>
                        </div>
                        <button className="text-muted/60 hover:text-danger transition-colors" title="Sign Out">
                            <LogOut size={14} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
