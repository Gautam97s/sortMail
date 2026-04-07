"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";

interface TopNavigationBarProps {
    onMobileSidebarOpen?: () => void;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
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
    searchPlaceholder = "Search your intelligent workspace..."
}: TopNavigationBarProps) {
    const [search, setSearch] = useState("");
    const { data: user } = useUser();

    useEffect(() => {
        onSearchChange?.(search);
    }, [search, onSearchChange]);

    return (
        <header className="h-tb border-b border-outline-variant/10 flex items-center justify-between px-6 shrink-0 bg-slate-50/80 backdrop-blur-md w-full sticky top-0 z-40">
            {/* Mobile Menu Button & Search */}
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
                <button 
                    onClick={onMobileSidebarOpen}
                    className="md:hidden p-2 hover:bg-slate-200/50 rounded-full transition-colors"
                >
                    <MaterialSymbol icon="menu" className="text-on-surface-variant" />
                </button>

                <div className="relative flex-1 group">
                    <MaterialSymbol 
                        icon="search" 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" 
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-10 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-fixed rounded-full text-sm transition-all outline-none text-on-surface placeholder:text-outline font-medium"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200/50 rounded-full transition-colors">
                        <MaterialSymbol icon="tune" className="text-outline text-lg" />
                    </button>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-4">
                <button className="p-2.5 text-on-surface-variant hover:bg-slate-200/50 rounded-full transition-colors relative">
                    <MaterialSymbol icon="notifications" className="text-xl" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-slate-50"></span>
                </button>
                
                <button className="p-2.5 text-on-surface-variant hover:bg-slate-200/50 rounded-full transition-colors">
                    <MaterialSymbol icon="settings" className="text-xl" />
                </button>

                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant/20">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-outline-variant/15 border-2 border-white cursor-pointer hover:ring-primary/30 transition-all">
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user.name || "User"} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
