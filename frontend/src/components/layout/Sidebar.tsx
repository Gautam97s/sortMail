"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Inbox,
    Users,
    CheckSquare,
    FileEdit,
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Tag
} from "lucide-react";
import { useNavCounts } from "@/hooks/useThreads";

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: counts } = useNavCounts();
    const status = { state: "online", lastSync: "Just now", activeRules: 0, tasksCompleted: 0, isOnline: true };

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Inbox", href: "/inbox", icon: Inbox, badge: counts?.inbox },
        { label: "Contacts", href: "/contacts", icon: Users },
        { label: "Drafts", href: "/drafts", icon: FileEdit, badge: counts?.drafts },
        { label: "Tags", href: "/tags", icon: Tag },
        { label: "Follow-ups", href: "/followups", icon: Clock },
    ];

    return (
        <aside
            className={`
                flex flex-col glass-card text-ink shrink-0 overflow-hidden border-r border-white/20 shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-50 rounded-none
                ${isOpen ? 'drawer open' : 'drawer'} md:relative md:translate-x-0
            `}
            style={{ width: collapsed ? 'var(--sidebar-col)' : 'var(--sidebar-w)' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-[56px] shrink-0 border-b border-border">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <span className="font-display italic text-accent font-bold text-2xl translate-y-[-1px]">S</span>
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
                                flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group
                                ${isActive ? `bg-accent text-white shadow-lg shadow-accent/30 ${!collapsed ? 'translate-x-1' : ''}` : "text-muted"}
                                ${collapsed ? "justify-center px-0" : "px-3"}
                            `}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={18} strokeWidth={2.5} className="shrink-0" />
                            {!collapsed && (
                                <>
                                    <span className="flex-1 text-[13px] font-semibold tracking-wide truncate">{item.label}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm min-w-[20px] text-center ${isActive ? 'bg-white/20 text-white' : 'bg-accent/20 text-accent'}`}>
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
            <div className="py-4 px-3 space-y-1 mt-auto border-t border-white/20 bg-white/10">
                {/* Connection Status */}
                {!collapsed && (
                    <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-success tracking-wide uppercase">
                        <span className={`w-1.5 h-1.5 rounded-full bg-success ${status.isOnline ? 'animate-pulse' : 'opacity-50'}`}></span>
                        {status.isOnline ? 'Online' : 'Offline'}
                    </div>
                )}

                {/* Collapse Toggle */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-muted hover:text-ink hover:bg-black/5 transition-colors cursor-pointer ${collapsed ? 'justify-center px-0' : 'px-3'}`}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        {!collapsed && <span className="text-[13px] font-medium">Collapse</span>}
                    </button>
                )}
            </div>
        </aside>
    );
}
