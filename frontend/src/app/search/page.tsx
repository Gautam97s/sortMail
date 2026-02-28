"use client";

import React, { useState } from "react";
import { Search as SearchIcon, X, Calendar, Paperclip, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { mockThreadListItems } from "@/data/threads";
import type { ThreadListItem } from "@/types/dashboard";
import AppShell from "@/components/layout/AppShell";

const FILTER_OPTIONS = [
    { id: "has_attachments", label: "Has Attachments", icon: Paperclip },
    { id: "urgent", label: "Urgent", icon: AlertCircle },
    { id: "unread", label: "Unread", icon: User },
];

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [results, setResults] = useState<ThreadListItem[]>([]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            // Filter mock data based on search query
            const filtered = mockThreadListItems.filter(
                (thread) =>
                    thread.subject.toLowerCase().includes(query.toLowerCase()) ||
                    thread.summary.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    const toggleFilter = (filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId)
                ? prev.filter((f) => f !== filterId)
                : [...prev, filterId]
        );
    };

    const clearFilters = () => {
        setActiveFilters([]);
        setSearchQuery("");
        setResults([]);
    };

    const getIntentColor = (intent: string) => {
        switch (intent) {
            case "urgent":
                return "bg-tag-urgent text-white";
            case "action_required":
                return "bg-tag-high text-white";
            case "fyi":
                return "bg-tag-low text-white";
            default:
                return "bg-muted text-ink";
        }
    };

    return (
        <AppShell title="Search">
            <div className="flex flex-col h-full bg-paper">
                {/* Header Section */}
                <div className="border-b border-border bg-white px-3 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <SearchIcon className="w-5 h-5 md:w-6 md:h-6 text-muted" />
                        <h1 className="font-display text-xl md:text-2xl text-ink">Search</h1>
                    </div>

                    {/* Search Input Container */}
                    <div className="relative max-w-2xl mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            type="text"
                            placeholder="Search emails, tasks..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 pr-10 h-10 md:h-12 text-sm md:text-base border-border focus:ring-accent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => handleSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span className="text-[10px] text-muted font-mono uppercase tracking-wide mr-1">
                            Filters:
                        </span>
                        {FILTER_OPTIONS.map((filter) => {
                            const Icon = filter.icon;
                            const isActive = activeFilters.includes(filter.id);
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => toggleFilter(filter.id)}
                                    className={`
                                        flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all
                                        ${isActive
                                            ? "bg-accent text-white shadow-md shadow-accent/20"
                                            : "bg-white border border-border text-ink hover:bg-paper-mid"
                                        }
                                    `}
                                >
                                    <Icon className="w-3 h-3" />
                                    {filter.label}
                                </button>
                            );
                        })}
                        {(activeFilters.length > 0 || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-6 px-2 text-[10px] md:text-xs text-muted hover:text-accent transition-colors"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content / Results Section */}
                <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-6 custom-scrollbar">
                    {!searchQuery && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-20 h-20 bg-paper-mid rounded-full flex items-center justify-center mb-6">
                                <SearchIcon className="w-10 h-10 text-muted/50" />
                            </div>
                            <h2 className="font-display text-xl text-ink mb-2">
                                Search your intelligence
                            </h2>
                            <p className="text-muted max-w-md text-sm leading-relaxed">
                                Find emails, tasks, and insights quickly. Use filters to narrow down the noise.
                            </p>
                        </div>
                    )}

                    {searchQuery && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-20 h-20 bg-paper-mid rounded-full flex items-center justify-center mb-6">
                                <X className="w-10 h-10 text-muted/50" />
                            </div>
                            <h2 className="font-display text-xl text-ink mb-2">
                                No results found
                            </h2>
                            <p className="text-muted max-w-md text-sm">
                                Try adjusting your search query or removing some filters.
                            </p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-[10px] text-muted font-mono uppercase tracking-widest">
                                    {results.length} result{results.length !== 1 ? "s" : ""} detected
                                </p>
                            </div>
                            <div className="space-y-3">
                                {results.map((thread) => (
                                    <Link key={thread.thread_id} href={`/inbox/${thread.thread_id}`} className="block group">
                                        <Card className="p-4 md:p-5 hover:border-accent/40 transition-all cursor-pointer bg-white group-hover:shadow-lg group-hover:shadow-ink/5">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-medium text-ink text-sm md:text-base truncate group-hover:text-accent transition-colors">
                                                            {thread.subject}
                                                        </h3>
                                                        {thread.has_attachments && (
                                                            <Paperclip className="w-3.5 h-3.5 text-muted shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs md:text-sm text-ink-light line-clamp-2 mb-4 leading-relaxed">
                                                        {thread.summary}
                                                    </p>
                                                    <div className="flex items-center justify-between sm:justify-start gap-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-[9px] md:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border-none shadow-none ${getIntentColor(thread.intent)}`}
                                                        >
                                                            {thread.intent.replace("_", " ")}
                                                        </Badge>
                                                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted font-medium">
                                                            <Calendar size={12} />
                                                            {new Date(thread.last_updated).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
