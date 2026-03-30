"use client";

import React from "react";
import { Search, Bell, Settings, LifeBuoy, Menu, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

interface TopbarProps {
    title?: string;
    subtitle?: string;
    onOpenSidebar?: () => void;
}

export default function Topbar({ title, subtitle, onOpenSidebar }: TopbarProps) {
    const { data: user } = useUser();

    return (
        <header className="h-[72px] bg-transparent flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 pt-4">
            <div className="flex items-center flex-1 max-w-xl gap-3">
                {onOpenSidebar && (
                    <button
                        onClick={onOpenSidebar}
                        className="btn-ghost p-2 md:hidden"
                        title="Open Menu"
                    >
                        <Menu size={20} />
                    </button>
                )}
                {/* Search Bar matching Stitch structure but Sortmail style */}
                <div className="relative w-full hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Search emails, tasks, or contacts... (⌘K)" 
                        className="w-full glass-card border-white/20 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-accent/50 outline-none text-ink placeholder:text-muted shadow-sm transition-all bg-white/40"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-4 shrink-0">
                {/* Miscellaneous Topbar Items */}
                <Link href="/settings">
                    <button className="btn-ghost p-2" title="Settings">
                        <Settings size={18} />
                    </button>
                </Link>
                <Link href="/support">
                    <button className="btn-ghost p-2" title="Support">
                        <LifeBuoy size={18} />
                    </button>
                </Link>

                {/* Notifications */}
                <Link href="/notifications">
                    <button className="btn-ghost relative p-2" title="Notifications">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-[#f0f3ff]" />
                    </button>
                </Link>

                <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
                
                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-2xl hover:bg-white/40 transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none text-ink">{user?.name || 'Gautam'}</p>
                        <p className="text-[10px] text-muted font-semibold mt-1 uppercase tracking-wider">{user?.plan || 'Pro'} Plan</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold shadow-sm">
                        {user?.name?.charAt(0) || 'G'}
                    </div>
                </div>
            </div>
        </header>
    );
}
