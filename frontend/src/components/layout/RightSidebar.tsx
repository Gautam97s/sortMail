"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Lightbulb, CheckSquare, Plus, Sparkles } from "lucide-react";

export default function RightSidebar() {
    const pathname = usePathname();
    const isCalendarActive = pathname === "/calendar" || pathname?.startsWith("/calendar/");
    const isTasksActive = pathname === "/tasks" || pathname?.startsWith("/tasks/");
    const isChatActive = pathname === "/chat" || pathname?.startsWith("/chat/");

    return (
        <aside className="hidden xl:flex w-16 bg-white/80 backdrop-blur-md border-l border-slate-200/60 flex-col items-center py-6 gap-6 shrink-0 relative z-20">
            <Link
                href="/chat"
                title="AI Chat"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isChatActive
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
                <Sparkles className="h-[20px] w-[20px]" />
            </Link>
            <Link
                href="/calendar"
                title="Calendar"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCalendarActive
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
                <Calendar className="h-[20px] w-[20px]" />
            </Link>
            <Link
                href="/ideas"
                title="Ideas"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    pathname === "/ideas" || pathname?.startsWith("/ideas/")
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
                <Lightbulb className="h-[20px] w-[20px]" />
            </Link>
            <Link
                href="/tasks"
                title="Tasks"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isTasksActive
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
                <CheckSquare className="h-[20px] w-[20px]" />
            </Link>
            <div className="mt-auto flex flex-col items-center gap-6">
                <button
                    title="Quick Add"
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent shadow-sm hover:border-indigo-100"
                >
                    <Plus className="h-[20px] w-[20px]" />
                </button>
            </div>
        </aside>
    );
}
