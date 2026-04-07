"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchResult {
    type: "thread" | "contact" | "task";
    id: string;
    title: string;
    subtitle: string;
    intent?: string;
    href: string;
    updated_at?: string;
}

interface SearchResponse {
    q: string;
    total: number;
    results: SearchResult[];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useUniversalSearch(q: string) {
    return useQuery<SearchResponse>({
        queryKey: ["search", q],
        queryFn: async () => {
            const { data } = await api.get(endpoints.search, { params: { q } });
            return data;
        },
        enabled: q.length >= 2,
        staleTime: 0,
        retry: 1,
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: string; label: string; colorClass: string }> = {
    thread: { icon: "mail", label: "Communication", colorClass: "bg-primary-fixed/20 text-primary" },
    contact: { icon: "person", label: "Entity", colorClass: "bg-tertiary-fixed/20 text-tertiary" },
    task: { icon: "task_alt", label: "Action Item", colorClass: "bg-secondary-fixed/20 text-secondary" },
};

function ResultCard({ result }: { result: SearchResult }) {
    const meta = TYPE_META[result.type];

    return (
        <Link href={result.href} className="block group">
            <div className="p-5 bg-white border border-outline-variant/10 rounded-2xl flex items-start gap-5 hover:border-primary-fixed hover:shadow-lg hover:shadow-primary/5 transition-all">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${meta.colorClass} border border-white/20 transition-transform group-hover:scale-105`}>
                    <MaterialSymbol icon={meta.icon} className="text-2xl" />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-headline font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {result.title}
                        </h3>
                        <div className="px-2 py-0.5 bg-surface-container text-outline-variant font-bold text-[8px] rounded uppercase tracking-widest">{meta.label}</div>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium line-clamp-2 leading-relaxed italic">{result.subtitle}</p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="p-1.5 bg-surface-container rounded-lg text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                        <MaterialSymbol icon="arrow_forward" className="text-sm" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SearchPage() {
    const [input, setInput] = useState("");
    const [q, setQ] = useState("");

    // Debounce: fire query 350ms after typing stops
    React.useEffect(() => {
        const t = setTimeout(() => setQ(input.trim()), 350);
        return () => clearTimeout(t);
    }, [input]);

    const { data, isLoading } = useUniversalSearch(q);

    // Grouping
    const threads = data?.results.filter((r) => r.type === "thread") ?? [];
    const contacts = data?.results.filter((r) => r.type === "contact") ?? [];
    const tasks = data?.results.filter((r) => r.type === "task") ?? [];

    const hasResults = (data?.total ?? 0) > 0;
    const noResults = q.length >= 2 && !isLoading && !hasResults;

    return (
        <AppShell title="Search Intelligence" subtitle="Universal Discovery Engine">
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
                
                {/* Discovery Command Bar */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary-fixed/30 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl" />
                    <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                            <MaterialSymbol icon="search" className="text-2xl text-outline group-focus-within:text-primary transition-colors" />
                            <div className="h-4 w-px bg-outline-variant/30 hidden md:block" />
                        </div>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Interrogate emails, entities, and actions..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-16 md:h-20 pl-16 pr-16 bg-white border border-outline-variant/15 focus:ring-2 focus:ring-primary-fixed rounded-3xl text-lg md:text-xl font-headline font-medium transition-all shadow-xl shadow-black/5 placeholder:text-outline-variant placeholder:font-normal"
                        />
                        {input && (
                            <button
                                onClick={() => { setInput(""); setQ(""); }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-surface-container rounded-2xl text-outline hover:text-error transition-all"
                            >
                                <MaterialSymbol icon="close" className="text-xl" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content States */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 bg-surface-container-low animate-pulse rounded-2xl border border-outline-variant/10" />
                        ))}
                    </div>
                )}

                {!q && !isLoading && (
                    <div className="py-24 text-center space-y-10">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-primary-fixed/20 blur-3xl rounded-full" />
                            <div className="relative h-32 w-32 rounded-[40px] bg-white border border-outline-variant/15 flex items-center justify-center text-primary shadow-xl">
                                <MaterialSymbol icon="database" className="text-6xl" />
                            </div>
                        </div>
                        <div className="space-y-3 max-w-sm mx-auto">
                            <h2 className="text-2xl font-headline font-bold text-on-surface">Unified Intelligence Search</h2>
                            <p className="text-on-surface-variant font-medium leading-relaxed italic">
                                Navigate your entire digital communication matrix. Type at least 2 characters to engage the discovery engine.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                { icon: "mail", label: "Email Threads" },
                                { icon: "account_circle", label: "Relationship Nodes" },
                                { icon: "check_circle", label: "Actionable Tasks" },
                            ].map((item) => (
                                <div key={item.label} className="px-5 py-3 bg-white border border-outline-variant/15 rounded-2xl flex items-center gap-3 text-xs font-bold text-on-surface shadow-sm">
                                    <MaterialSymbol icon={item.icon} className="text-primary" />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {noResults && (
                    <div className="py-24 text-center bg-white rounded-[40px] border border-outline-variant/10 shadow-sm space-y-6">
                        <div className="h-20 w-20 bg-surface-container rounded-3xl flex items-center justify-center mx-auto text-outline-variant">
                            <MaterialSymbol icon="search_off" className="text-4xl" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-headline font-bold text-on-surface">No Correlation Found</h2>
                            <p className="text-sm text-on-surface-variant font-medium">No results for &quot;{q}&quot; in the current context.</p>
                        </div>
                    </div>
                )}

                {hasResults && !isLoading && (
                    <div className="space-y-12">
                        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                            <div className="flex items-center gap-2 text-outline-variant uppercase tracking-widest text-[10px] font-black">
                                <MaterialSymbol icon="insights" className="text-base" />
                                Analysis complete
                            </div>
                            <div className="px-3 py-1 bg-primary-fixed/20 text-primary font-black text-[10px] rounded-full uppercase tracking-tighter">
                                {data!.total} Discoveries
                            </div>
                        </div>

                        <div className="grid gap-12">
                            {threads.length > 0 && (
                                <ResultSection title="Communications" icon="chat_bubble" count={threads.length}>
                                    {threads.map((r) => <ResultCard key={r.id} result={r} />)}
                                </ResultSection>
                            )}
                            {contacts.length > 0 && (
                                <ResultSection title="Intelligence Nodes" icon="group" count={contacts.length}>
                                    {contacts.map((r) => <ResultCard key={r.id} result={r} />)}
                                </ResultSection>
                            )}
                            {tasks.length > 0 && (
                                <ResultSection title="Priority Actions" icon="ballot" count={tasks.length}>
                                    {tasks.map((r) => <ResultCard key={r.id} result={r} />)}
                                </ResultSection>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}

function ResultSection({ title, icon, count, children }: { title: string, icon: string, count: number, children: React.ReactNode }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-surface-container flex items-center justify-center rounded-xl text-outline">
                    <MaterialSymbol icon={icon} />
                </div>
                <div className="flex-1 border-b border-outline-variant/5 pb-2 flex items-baseline gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">{title}</h2>
                    <span className="text-on-surface-variant/30 text-[9px] font-black">• {count} item{count !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div className="grid gap-3">
                {children}
            </div>
        </div>
    );
}
