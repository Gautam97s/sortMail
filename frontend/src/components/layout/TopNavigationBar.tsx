"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";

interface TopNavigationBarProps {
    onMobileSidebarOpen?: () => void;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    title?: string;
    subtitle?: string;
}

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function TopNavigationBar({
    onMobileSidebarOpen,
    onSearchChange,
    searchPlaceholder = "Search your intelligent workspace...",
    title,
    subtitle,
}: TopNavigationBarProps) {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: user } = useUser();
    const { data: notificationCount } = useNotificationUnreadCount();

    useEffect(() => {
        const urlQuery = searchParams.get("q") || "";
        setSearch(urlQuery);
    }, [pathname, searchParams]);

    useEffect(() => {
        onSearchChange?.(search);
    }, [search, onSearchChange]);

    const openSearchPage = () => {
        const query = search.trim();
        router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    };

    return (
        <header className="h-tb border-b border-outline-variant/10 flex items-center justify-between px-3 md:px-4 shrink-0 bg-surface-container-lowest w-full sticky top-0 z-40">
            {/* Mobile Menu Button & Search */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <button 
                    onClick={onMobileSidebarOpen}
                    className="md:hidden p-1.5 hover:bg-surface-container rounded-xl transition-colors"
                >
                    <MaterialSymbol icon="menu" className="text-on-surface-variant" />
                </button>

                <div className="hidden xl:flex flex-col min-w-0 mr-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-outline">SortMail AI</span>
                    <div className="flex items-center gap-3 min-w-0">
                        {title && <span className="font-headline text-xs font-bold text-on-surface truncate">{title}</span>}
                        {subtitle && <span className="text-[11px] font-medium text-on-surface-variant truncate">{subtitle}</span>}
                    </div>
                </div>

                <div className="relative flex-1 max-w-2xl group min-w-0">
                    <MaterialSymbol 
                        icon="search" 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" 
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (onSearchChange && pathname !== "/search") {
                                    return;
                                }
                                openSearchPage();
                            }
                        }}
                        className="w-full h-9 pl-9 pr-10 bg-surface-container-low border border-outline-variant/20 focus:bg-white focus:ring-2 focus:ring-primary-fixed rounded-full text-xs transition-all outline-none text-on-surface placeholder:text-outline font-medium shadow-sm"
                    />
                    <button
                        onClick={openSearchPage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container rounded-full transition-colors"
                        aria-label="Open search"
                    >
                        <MaterialSymbol icon="travel_explore" className="text-outline text-lg" />
                    </button>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-2.5 shrink-0">
                <Link href="/notifications" className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative" aria-label="Notifications">
                    <MaterialSymbol icon="notifications" className="text-xl" />
                    {(notificationCount?.unread || 0) > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
                    )}
                </Link>
                
                <Link href="/settings" className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors" aria-label="Settings">
                    <MaterialSymbol icon="settings" className="text-xl" />
                </Link>

                <div className="flex items-center gap-2 ml-1 pl-2.5 border-l border-outline-variant/20">
                    <div className="hidden md:flex flex-col items-end leading-tight mr-1">
                        <span className="text-xs font-bold text-on-surface">{user?.name || 'Gautam'}</span>
                        <span className="text-[9px] uppercase tracking-wider text-outline font-bold">{user?.plan || 'Pro'} Plan</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-outline-variant/15 border border-white cursor-pointer hover:ring-primary/30 transition-all bg-primary-fixed flex items-center justify-center">
                        {user?.avatar ? (
                            <Image 
                                src={user.avatar} 
                                alt={user.name || "User"} 
                                width={40} 
                                height={40} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
