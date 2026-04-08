"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { formatDistanceToNow } from "date-fns";
import { useContacts, useToggleUnsubscribe } from "@/hooks/useContacts";
import { Contact } from "@/types/dashboard";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

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

    return (
        <AppShell title="Contacts" subtitle={`${contacts.length} intelligence nodes`}>
            <div className="max-w-[1280px] mx-auto p-4 md:p-6 space-y-5">
                <section className="relative overflow-hidden rounded-2xl bg-white border border-outline-variant/10 p-5 md:p-5 tonal-shadow">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary-fixed/20 blur-2xl -mr-10 -mt-10" />
                    <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div className="space-y-2.5 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/25 text-primary text-[9px] font-bold uppercase tracking-[0.24em] w-fit">
                                <MaterialSymbol icon="group" className="text-sm" />
                                Relationship Intelligence
                            </div>
                            <div>
                                <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface tracking-tight">People you actually need to remember</h1>
                                <p className="mt-2 text-on-surface-variant max-w-2xl">
                                    Search the network, sort by momentum, and keep the strongest relationships in view.
                                </p>
                            </div>
                        </div>

                        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all w-full lg:w-auto text-[13px] shrink-0">
                            <MaterialSymbol icon="person_add" className="text-lg" />
                            New Contact
                        </button>
                    </div>

                    <div className="mt-5 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
                        <div className="relative w-full md:max-w-md group">
                        <MaterialSymbol 
                            icon="search" 
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" 
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find contacts, companies or domains..."
                            className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant/15 focus:ring-2 focus:ring-primary-fixed rounded-xl text-[13px] transition-all shadow-sm font-medium"
                        />
                        </div>
                        
                        <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10 shadow-inner overflow-hidden w-full xl:w-auto">
                        {(["most_emails", "recent", "alphabetical"] as SortOption[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setSort(s)}
                                className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all flex-1 md:flex-none whitespace-nowrap ${sort === s ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                            >
                                {s === "most_emails" ? "Priority" : s === "recent" ? "Recency" : "A–Z"}
                            </button>
                        ))}
                    </div>
                    </div>
                </section>

                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-36 rounded-2xl bg-surface-container-low animate-pulse border border-outline-variant/10" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center gap-5 bg-white rounded-2xl border border-outline-variant/10 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-outline-variant">
                            <MaterialSymbol icon="person_search" className="text-5xl" />
                        </div>
                        <div className="space-y-1 text-center max-w-sm">
                            <h3 className="text-lg font-headline font-bold text-on-surface">No Intelligence Matches</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                {contacts.length === 0 
                                    ? "Relationship nodes will manifest here as your inbox intelligence expands." 
                                    : "No entities found for this query within your current network."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(contact => (
                            <ContactCard 
                                key={contact.id} 
                                contact={contact} 
                                initials={getInitials(contact)}
                                onUnsubscribe={() => toggleUnsubscribe({ contactId: contact.id, email: contact.email_address })}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}

function ContactCard({ contact, initials, onUnsubscribe, isPending }: { 
    contact: Contact, 
    initials: string, 
    onUnsubscribe: () => void,
    isPending: boolean 
}) {
    const signalLabel = contact.interaction_count >= 20 ? "Core contact" : contact.interaction_count >= 8 ? "Warm lead" : "Low signal";
    const signalTone = contact.interaction_count >= 20 ? "bg-primary-fixed/20 text-primary" : contact.interaction_count >= 8 ? "bg-tertiary-container text-tertiary" : "bg-surface-container-high text-outline";

    return (
        <div className={`group bg-white rounded-2xl border border-outline-variant/10 p-4 hover:border-primary-fixed hover:shadow-md hover:shadow-primary/5 transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px] ${contact.is_unsubscribed ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-3 gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary-fixed/20 text-primary font-bold flex items-center justify-center text-sm shadow-sm border border-primary/5 transition-transform group-hover:scale-105 shrink-0">
                    {initials}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container rounded-xl text-outline hover:text-tertiary transition-colors">
                        <MaterialSymbol icon="star" filled={contact.is_vip} />
                    </button>
                    <Link href={`/contacts/${encodeURIComponent(contact.email_address)}`} className="p-2 hover:bg-surface-container rounded-xl text-outline hover:text-primary transition-colors">
                        <MaterialSymbol icon="open_in_new" />
                    </Link>
                </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-headline font-bold text-on-surface truncate">
                        {contact.name || contact.email_address.split('@')[0]}
                    </h3>
                    {contact.is_unsubscribed && (
                        <div className="px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant font-bold text-[8px] rounded uppercase tracking-widest">Muted</div>
                    )}
                </div>
                <p className="text-xs text-on-surface-variant font-medium truncate">{contact.email_address}</p>
                {contact.company && (
                    <div className="flex items-center gap-1.5 text-xs text-outline font-bold uppercase tracking-wider mt-1">
                        <MaterialSymbol icon="corporate_fare" className="text-sm" />
                        {contact.company}
                    </div>
                )}
            </div>

            <div className="mt-3 rounded-xl border border-primary-fixed/10 bg-primary-fixed/5 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">AI Intelligence</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${signalTone}`}>
                        {signalLabel}
                    </span>
                </div>
                <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed">
                    {contact.interaction_count} interactions indexed · {contact.last_interaction_at ? `last seen ${formatDistanceToNow(new Date(contact.last_interaction_at), { addSuffix: false })} ago` : 'no recent activity'}
                </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-outline-variant/5 gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                        <MaterialSymbol icon="mail" className="text-sm text-outline" />
                        <span className="tabular-nums">{contact.interaction_count}</span>
                    </div>
                    {contact.last_interaction_at && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <MaterialSymbol icon="schedule" className="text-sm text-outline" />
                            <span>{formatDistanceToNow(new Date(contact.last_interaction_at), { addSuffix: false })}</span>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        onUnsubscribe();
                    }}
                    disabled={isPending}
                    className={`p-2 rounded-xl transition-all ${contact.is_unsubscribed ? "bg-primary-fixed/20 text-primary hover:bg-primary-fixed/30" : "bg-surface-container hover:bg-error-container hover:text-error text-outline"}`}
                >
                    <MaterialSymbol icon={contact.is_unsubscribed ? "notifications_active" : "notifications_off"} className="text-lg" />
                </button>
            </div>
        </div>
    );
}
