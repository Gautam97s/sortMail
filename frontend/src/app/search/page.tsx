"use client";

import React, { useState } from "react";
import {
    Search as SearchIcon, X, Mail, User, CheckSquare,
    AlertCircle, Clock, FileText, ArrowUpRight, Paperclip
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";

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

const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    thread: { icon: Mail, label: "Email", color: "bg-blue-500/10 text-blue-600" },
    contact: { icon: User, label: "Contact", color: "bg-purple-500/10 text-purple-600" },
    task: { icon: CheckSquare, label: "Task", color: "bg-emerald-500/10 text-emerald-600" },
};

const INTENT_STYLES: Record<string, string> = {
    urgent: "bg-tag-urgent text-white",
    action_required: "bg-tag-high text-white",
    fyi: "bg-paper-deep text-muted",
    scheduling: "bg-blue-100 text-blue-700",
};

function ResultCard({ result }: { result: SearchResult }) {
    const meta = TYPE_META[result.type];
    const Icon = meta.icon;

    return (
        <Link href={result.href} className="block group">
            <Card className="p-4 hover:border-accent/40 hover:shadow-md transition-all cursor-pointer bg-white">
                <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-ink text-sm truncate group-hover:text-accent transition-colors">
                                {result.title}
                            </h3>
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-mono uppercase tracking-wide shrink-0">
                                {meta.label}
                            </Badge>
                            {result.intent && INTENT_STYLES[result.intent] && (
                                <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 font-black uppercase tracking-wider shrink-0 border-none ${INTENT_STYLES[result.intent]}`}>
                                    {result.intent.replace("_", " ")}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">{result.subtitle}</p>
                    </div>

                    {/* Date + Arrow */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {result.updated_at && (
                            <span className="text-[10px] text-muted font-mono tabular-nums">
                                {new Date(result.updated_at).toLocaleDateString()}
                            </span>
                        )}
                        <ArrowUpRight className="w-4 h-4 text-border opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </Card>
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

    // Group results by type for a structured display
    const threads = data?.results.filter((r) => r.type === "thread") ?? [];
    const contacts = data?.results.filter((r) => r.type === "contact") ?? [];
    const tasks = data?.results.filter((r) => r.type === "task") ?? [];

    const hasResults = (data?.total ?? 0) > 0;
    const noResults = q.length >= 2 && !isLoading && !hasResults;

    return (
        <AppShell title="Search">
            <div className="max-w-3xl mx-auto px-4">
                {/* ── Search Input ─────────────────────────────────────── */}
                <div className="relative mb-6">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <Input
                        autoFocus
                        type="text"
                        placeholder="Search emails, contacts, tasks..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="pl-12 pr-12 h-14 text-base border-border focus:ring-accent shadow-sm rounded-xl"
                    />
                    {input && (
                        <button
                            onClick={() => { setInput(""); setQ(""); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── Loading skeletons ────────────────────────────────── */}
                {isLoading && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-[72px] bg-paper-mid animate-pulse rounded-xl border border-border-light" />
                        ))}
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────── */}
                {!q && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-paper-mid rounded-full flex items-center justify-center mb-6">
                            <SearchIcon className="w-10 h-10 text-muted/40" />
                        </div>
                        <h2 className="font-display text-xl text-ink mb-2">Search everything</h2>
                        <p className="text-muted text-sm max-w-sm leading-relaxed">
                            Find emails, contacts, and tasks from one place. Type at least 2 characters to start.
                        </p>
                        <div className="flex gap-3 mt-6">
                            {[
                                { icon: Mail, label: "Emails" },
                                { icon: User, label: "Contacts" },
                                { icon: CheckSquare, label: "Tasks" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-mid rounded-lg text-xs text-muted">
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── No Results ───────────────────────────────────────── */}
                {noResults && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-paper-mid rounded-full flex items-center justify-center mb-4">
                            <X className="w-8 h-8 text-muted/40" />
                        </div>
                        <h2 className="font-display text-lg text-ink mb-1">No results for &quot;{q}&quot;</h2>
                        <p className="text-muted text-sm">Try different keywords.</p>
                    </div>
                )}

                {/* ── Results ──────────────────────────────────────────── */}
                {hasResults && !isLoading && (
                    <div className="space-y-6">
                        <p className="text-xs text-muted font-mono uppercase tracking-widest">
                            {data!.total} result{data!.total !== 1 ? "s" : ""} for &quot;{q}&quot;
                        </p>

                        {threads.length > 0 && (
                            <Section title="Emails" icon={Mail} count={threads.length}>
                                {threads.map((r) => <ResultCard key={r.id} result={r} />)}
                            </Section>
                        )}
                        {contacts.length > 0 && (
                            <Section title="Contacts" icon={User} count={contacts.length}>
                                {contacts.map((r) => <ResultCard key={r.id} result={r} />)}
                            </Section>
                        )}
                        {tasks.length > 0 && (
                            <Section title="Tasks" icon={CheckSquare} count={tasks.length}>
                                {tasks.map((r) => <ResultCard key={r.id} result={r} />)}
                            </Section>
                        )}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

function Section({
    title, icon: Icon, count, children
}: {
    title: string;
    icon: React.ElementType;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-muted" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted">{title}</h2>
                <span className="text-xs text-muted bg-paper-mid rounded-full px-1.5 py-0.5 font-mono">{count}</span>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    );
}
