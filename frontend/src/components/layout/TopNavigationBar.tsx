"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

interface TopNavigationBarProps {
    onMobileSidebarOpen?: () => void;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
}

export default function TopNavigationBar({
    onMobileSidebarOpen,
    onSearchChange,
    searchPlaceholder = "Search emails, subjects or summaries..."
}: TopNavigationBarProps) {
    const [search, setSearch] = useState("");
    const { data: user } = useUser();

    useEffect(() => {
        onSearchChange?.(search);
    }, [search, onSearchChange]);

    return (
        <header className="h-[72px] md:h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white w-full">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMobileSidebarOpen}
                    className="text-slate-500"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl px-2 md:px-0">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 rounded-xl py-2 md:py-2.5 pl-10 pr-4 text-sm transition-all outline-none text-slate-900 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4 ml-2 md:ml-6">
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative hidden sm:block">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors hidden sm:block">
                    <Settings className="h-5 w-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 md:ml-2">
                    <span className="text-[10px] font-bold text-slate-600">
                        {user?.name?.charAt(0) || "U"}
                    </span>
                </div>
            </div>
        </header>
    );
}
