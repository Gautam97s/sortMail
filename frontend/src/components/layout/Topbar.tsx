"use client";

import React from "react";
import { Search, Bell, User, Menu } from "lucide-react";
import Link from "next/link";
import { mockUserProfile } from "@/data/user";

interface TopbarProps {
    title: string;
    subtitle?: string;
    onMenuClick?: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
    const user = mockUserProfile;

    return (
        <header className="h-[56px] border-b border-border bg-white flex items-center px-4 md:px-6 justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="btn-ghost p-2 md:hidden"
                        title="Open Menu"
                    >
                        <Menu size={20} />
                    </button>
                )}
                <div>
                    {subtitle && (
                        <span className="text-[10px] md:text-xs font-mono text-muted uppercase tracking-widest">{subtitle} /</span>
                    )}
                    <h1 className="text-base md:text-lg font-display text-ink leading-tight truncate max-w-[150px] md:max-w-none">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Search Trigger */}
                <Link href="/search">
                    <button className="btn-ghost" title="Search (⌘K)">
                        <Search size={16} />
                        <span className="text-xs text-muted hidden sm:inline">⌘K</span>
                    </button>
                </Link>

                {/* Notifications */}
                <Link href="/notifications">
                    <button className="btn-ghost relative" title="Notifications">
                        <Bell size={16} />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white" />
                    </button>
                </Link>

                {/* Avatar */}
                <Link href="/settings">
                    <div className="w-8 h-8 rounded-full bg-paper-deep flex items-center justify-center border border-border-light cursor-pointer hover:border-ink-light transition-colors">
                        <span className="text-[10px] font-bold text-ink-light">{user.initials}</span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
