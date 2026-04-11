"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function SearchPageContent() {
    const searchParams = useSearchParams();
    const q = (searchParams.get("q") || "").trim();

    const { data, isLoading } = useUniversalSearch(q);

    // Grouping
    const threads = data?.results.filter((r) => r.type === "thread") ?? [];
    const contacts = data?.results.filter((r) => r.type === "contact") ?? [];
    const tasks = data?.results.filter((r) => r.type === "task") ?? [];

    const hasResults = (data?.total ?? 0) > 0;
    const noResults = q.length >= 2 && !isLoading && !hasResults;

    return (
        <AppShell title="Search Intelligence" subtitle="Universal Discovery Engine" hideSearch>
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
                <section className="relative overflow-hidden rounded-[32px] bg-white border border-outline-variant/10 p-6 md:p-8 tonal-shadow">
                    <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary-fixed/25 blur-3xl -mr-12 -mt-12" />
                    <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-tertiary-fixed/15 blur-3xl -ml-10 -mb-10" />
                    <div className="relative space-y-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/25 text-primary text-[10px] font-bold uppercase tracking-[0.24em] w-fit">
                                <MaterialSymbol icon="travel_explore" className="text-sm" />
                                Search Intelligence
                            </div>
                            <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
                                {q ? `Results for "${q}"` : "Find threads, people, and actions faster"}
                            </h1>
                            <p className="text-on-surface-variant max-w-2xl">
                                {q
                                    ? "Search runs from the top bar now, so this page stays focused on results."
                                    : "Use the top bar search to query across threads, contacts, and tasks."
                                }
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { icon: 'mail', label: 'Email Threads', tone: 'primary' },
                                { icon: 'group', label: 'Relationship Nodes', tone: 'tertiary' },
                                { icon: 'check_circle', label: 'Actionable Tasks', tone: 'secondary' },
                            ].map((item) => (
                                <div key={item.label} className="px-4 py-3 bg-surface-container-low rounded-2xl border border-outline-variant/10 flex items-center gap-3 text-sm font-bold text-on-surface">
                                    <MaterialSymbol icon={item.icon} className={`text-${item.tone}`} />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

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
                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                            {[
                                { label: "newsletter", href: "/search?q=newsletter" },
                                { label: "invoice", href: "/search?q=invoice" },
                                { label: "meeting", href: "/search?q=meeting" },
                            ].map((item) => (
                                <Link key={item.label} href={item.href} className="px-4 py-2 rounded-full bg-surface-container text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-primary-fixed/15 transition-colors">
                                    Try {item.label}
                                </Link>
                            ))}
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

                {!q && !isLoading && (
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { label: "Recent", query: "follow up" },
                            { label: "Urgent", query: "urgent" },
                            { label: "People", query: "from:" },
                        ].map((item) => (
                            <Link key={item.label} href={`/search?q=${encodeURIComponent(item.query)}`} className="p-4 rounded-3xl bg-white border border-outline-variant/10 hover:border-primary-fixed hover:shadow-md transition-all text-left">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-outline-variant mb-2">Quick start</div>
                                <div className="font-headline font-bold text-on-surface text-lg">{item.label}</div>
                                <div className="text-sm text-on-surface-variant mt-1">{item.query}</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// Loading fallback
function SearchPageFallback() {
    return (
        <AppShell title="Search Intelligence" subtitle="Universal Discovery Engine" hideSearch>
            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-24 bg-surface-container-low animate-pulse rounded-2xl border border-outline-variant/10" />
                ))}
            </div>
        </AppShell>
    );
}

// Default export wrapped in Suspense
export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageFallback />}>
            <SearchPageContent />
        </Suspense>
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
