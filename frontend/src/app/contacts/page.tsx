"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Mail, TrendingUp, Clock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { api, endpoints } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Contact {
    email: string;
    name: string;
    total_threads: number;
    last_contact: string | null;
}

type SortOption = "most_emails" | "recent" | "alphabetical";

export default function ContactsPage() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("most_emails");

    const { data: contacts = [], isLoading } = useQuery<Contact[]>({
        queryKey: ["contacts"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.contacts);
            return data;
        },
    });

    const filtered = useMemo(() => {
        let items = contacts;
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(c =>
                c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
            );
        }
        if (sort === "most_emails") items = [...items].sort((a, b) => b.total_threads - a.total_threads);
        if (sort === "alphabetical") items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        if (sort === "recent") items = [...items].sort((a, b) =>
            new Date(b.last_contact ?? 0).getTime() - new Date(a.last_contact ?? 0).getTime()
        );
        return items;
    }, [contacts, search, sort]);

    const getInitials = (name: string) =>
        name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    if (isLoading) {
        return (
            <AppShell title="Contacts">
                <div className="max-w-4xl mx-auto p-6 grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 rounded-xl bg-paper-mid animate-pulse" />
                    ))}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Contacts" subtitle={`${contacts.length} people`}>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Search + Sort */}
                <div className="flex gap-3 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search contacts..."
                            className="pl-10 bg-paper"
                        />
                    </div>
                    <div className="flex gap-1">
                        {(["most_emails", "recent", "alphabetical"] as SortOption[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setSort(s)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sort === s ? "bg-primary text-white" : "bg-paper-mid text-ink-light hover:bg-paper"}`}
                            >
                                {s === "most_emails" ? "Most Emails" : s === "recent" ? "Recent" : "A–Z"}
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <Card className="p-12 text-center text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">
                            {contacts.length === 0 ? "No contacts yet" : "No results found"}
                        </p>
                        <p className="text-sm mt-1">
                            {contacts.length === 0
                                ? "Contacts appear automatically from your synced emails."
                                : "Try a different search term."}
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {filtered.map(contact => (
                            <Link key={contact.email} href={`/contacts/${encodeURIComponent(contact.email)}`}>
                                <Card className="p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                                    <Avatar className="h-11 w-11 border border-border-light">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                            {getInitials(contact.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-ink truncate group-hover:text-primary transition-colors">
                                            {contact.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                                    </div>
                                    <div className="text-right shrink-0 space-y-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                            <Mail className="h-3 w-3" />
                                            {contact.total_threads}
                                        </div>
                                        {contact.last_contact && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(contact.last_contact), { addSuffix: true })}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
