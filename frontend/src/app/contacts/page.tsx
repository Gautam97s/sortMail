"use client";

import React, { useState, useMemo } from "react";
import { Search, Mail, Clock, User, Star, BellOff, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";
import { formatDistanceToNow } from "date-fns";
import { useContacts, useToggleUnsubscribe } from "@/hooks/useContacts";
import { Contact } from "@/types/dashboard";

type SortOption = "most_emails" | "recent" | "alphabetical";

export default function ContactsPage() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("most_emails");

    const { data: contacts = [], isLoading } = useContacts();
    const { mutate: toggleUnsubscribe, isPending } = useToggleUnsubscribe();

    const filtered = useMemo(() => {
        let items = contacts;
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(c =>
                (c.name ?? "").toLowerCase().includes(q) || c.email_address.toLowerCase().includes(q)
            );
        }
        if (sort === "most_emails") items = [...items].sort((a, b) => b.interaction_count - a.interaction_count);
        if (sort === "alphabetical") items = [...items].sort((a, b) => (a.name ?? a.email_address).localeCompare(b.name ?? b.email_address));
        if (sort === "recent") items = [...items].sort((a, b) =>
            new Date(b.last_interaction_at ?? 0).getTime() - new Date(a.last_interaction_at ?? 0).getTime()
        );
        return items;
    }, [contacts, search, sort]);

    const getInitials = (contact: Contact) => {
        const name = contact.name ?? contact.email_address;
        return name.split(/[\s@]/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
    };

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
                                {s === "most_emails" ? "Most Active" : s === "recent" ? "Recent" : "A–Z"}
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
                                ? "Contacts appear automatically as emails are synced and analysed."
                                : "Try a different search term."}
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {filtered.map(contact => (
                            <Card
                                key={contact.id}
                                className={`p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-sm transition-all group ${contact.is_unsubscribed ? "opacity-60" : ""}`}
                            >
                                <Avatar className="h-11 w-11 border border-border-light">
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                                        {getInitials(contact)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-ink truncate group-hover:text-primary transition-colors">
                                            {contact.name ?? contact.email_address}
                                        </p>
                                        {contact.is_vip && (
                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                                        )}
                                        {contact.is_unsubscribed && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                Unsubscribed
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{contact.email_address}</p>
                                    {contact.company && (
                                        <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 space-y-1.5">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                        <Mail className="h-3 w-3" />
                                        {contact.interaction_count}
                                    </div>
                                    {contact.last_interaction_at && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(contact.last_interaction_at), { addSuffix: true })}
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 px-2 text-xs ${contact.is_unsubscribed ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-destructive"}`}
                                        onClick={() => toggleUnsubscribe(contact.id)}
                                        disabled={isPending}
                                    >
                                        {contact.is_unsubscribed ? (
                                            <><Bell className="h-3 w-3 mr-1" /> Resubscribe</>
                                        ) : (
                                            <><BellOff className="h-3 w-3 mr-1" /> Unsubscribe</>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
