"use client";

import React from "react";
import { usePathname } from "next/navigation";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function RightSidebar() {
    const pathname = usePathname();
    const isInbox = pathname === "/inbox" || pathname?.startsWith("/inbox/");

    return (
        <aside className="w-full h-full flex flex-col bg-surface-container-low overflow-y-auto custom-scrollbar select-none">
            {/* Header / Active Context */}
            <div className="p-6 border-b border-outline-variant/10">
                <div className="flex items-center gap-2 mb-4">
                    <MaterialSymbol icon="psychology" filled className="text-primary text-xl" />
                    <span className="text-[11px] font-bold text-outline uppercase tracking-widest">
                        Intelligence Pane
                    </span>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-outline-variant/10 shadow-sm">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-1 block">Active Context</span>
                    <h3 className="text-sm font-bold text-on-surface truncate">
                        {isInbox ? "Thread: Q1 Budget Review" : "Global Overview"}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                        Analyzing 12 messages with focus on pending approvals and fiscal deadlines.
                    </p>
                </div>
            </div>

            {/* Impact Score Section */}
            <div className="p-6 border-b border-outline-variant/10">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-container-high" />
                            <circle 
                                cx="18" 
                                cy="18" 
                                r="16" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                strokeDasharray="88, 100" 
                                strokeLinecap="round" 
                                className="text-primary drop-shadow-[0_0_8px_rgba(0,91,191,0.3)]" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-headline font-bold text-on-surface tracking-tighter">88</span>
                            <span className="text-[10px] font-bold text-outline uppercase">Impact</span>
                        </div>
                    </div>
                    
                    <div className="text-center px-4">
                        <p className="text-xs font-semibold text-on-surface-variant leading-relaxed">
                            This context has <span className="text-primary font-bold">high priority</span> due to a mentioned deadline on <span className="text-on-surface font-bold">April 15th</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Intent / Sentiment Grid */}
            <div className="p-6 border-b border-outline-variant/10">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 block text-center">Inferred Intent</span>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Urgent', icon: 'priority_high', active: true, color: 'error' },
                        { label: 'Financial', icon: 'payments', active: true, color: 'primary' },
                        { label: 'External', icon: 'public', active: false, color: 'secondary' },
                        { label: 'Scheduling', icon: 'event_repeat', active: false, color: 'tertiary' },
                    ].map((item, i) => (
                        <div 
                            key={i} 
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                                item.active 
                                ? `bg-white border-outline-variant/20 shadow-sm` 
                                : `bg-surface-container border-transparent opacity-40`
                            }`}
                        >
                            <MaterialSymbol 
                                icon={item.icon} 
                                filled={item.active} 
                                className={`text-xl ${item.active ? `text-${item.color}` : 'text-outline'}`} 
                            />
                            <span className="text-[10px] font-bold text-on-surface-variant">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Actions */}
            <div className="p-6 mt-auto">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 block">Smart Actions</span>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-tertiary-fixed/30 text-tertiary-container hover:bg-tertiary-fixed/50 transition-all rounded-2xl border border-tertiary-fixed ring-1 ring-white/20">
                        <div className="flex items-center gap-3">
                            <MaterialSymbol icon="auto_awesome" filled className="text-lg" />
                            <span className="text-xs font-bold font-headline">Draft AI Reply</span>
                        </div>
                        <MaterialSymbol icon="chevron_right" className="text-lg opacity-50" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-surface-container transition-all rounded-2xl border border-outline-variant/10 shadow-sm group">
                        <div className="flex items-center gap-3">
                            <MaterialSymbol icon="checklist" className="text-lg text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-on-surface">Extract Tasks</span>
                        </div>
                        <MaterialSymbol icon="add" className="text-lg text-outline" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
