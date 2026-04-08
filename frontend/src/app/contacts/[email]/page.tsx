"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, Clock, ArrowLeft, Send, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useContact, useContactThreads, useToggleUnsubscribe, useAddContactTag, useRemoveContactTag } from "@/hooks/useContacts";
import { formatDistanceToNow } from "date-fns";
import { Plus, X, Bell, BellOff } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getIntentColor(intent: string) {
    switch (intent) {
        case "urgent": return "bg-tag-urgent text-white";
        case "action_required": return "bg-tag-high text-white";
        case "fyi": return "bg-tag-low text-white";
        default: return "bg-muted text-ink";
    }
}

// ─── ThreadCard ──────────────────────────────────────────────────────────────

function ThreadCard({ thread }: { thread: any }) {
    return (
        <Link href={`/inbox/${thread.thread_id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-ink truncate mb-1">{thread.subject}</h3>
                        <p className="text-sm text-muted line-clamp-2 mb-2">{thread.summary}</p>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-xs ${getIntentColor(thread.intent)}`}>
                                {thread.intent?.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted">
                                {new Date(thread.last_updated).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

// ─── ThreadSection ───────────────────────────────────────────────────────────

function ThreadSection({
    title,
    icon,
    threads,
    isLoading,
    emptyText,
}: {
    title: string;
    icon: React.ReactNode;
    threads: any[];
    isLoading: boolean;
    emptyText: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                {icon}
                <h2 className="font-display text-lg text-ink">{title}</h2>
                {!isLoading && (
                    <span className="text-xs text-muted bg-paper-mid rounded-full px-2 py-0.5">
                        {threads.length}
                    </span>
                )}
            </div>
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-[90px] bg-paper-mid animate-pulse rounded-xl border border-border-light" />
                    ))}
                </div>
            ) : threads.length === 0 ? (
                <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-lg">
                    {emptyText}
                </p>
            ) : (
                <div className="space-y-2">
                    {threads.map((thread) => (
                        <ThreadCard key={thread.thread_id} thread={thread} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const email = decodeURIComponent(params.email as string);

    const { data: contact, isLoading: isLoadingContact } = useContact(email);
    const contactId = contact?.id || "";

    // Load "from" and "to" threads in parallel
    const { data: fromThreads = [], isLoading: isLoadingFrom } = useContactThreads(contactId, "from");
    const { data: toThreads = [], isLoading: isLoadingTo } = useContactThreads(contactId, "to");

    const { mutate: toggleUnsubscribe, isPending: isUnsubscribing } = useToggleUnsubscribe();
    const { mutate: addTag } = useAddContactTag();
    const { mutate: removeTag } = useRemoveContactTag();

    const [newTagName, setNewTagName] = React.useState("");
    const [showTagInput, setShowTagInput] = React.useState(false);

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    if (isLoadingContact) {
        return (
            <div className="flex items-center justify-center h-full bg-paper">
                <div className="animate-pulse text-muted">Loading contact...</div>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-paper gap-4">
                <div className="text-xl font-display text-muted">Contact not found</div>
                <Button onClick={() => router.push("/contacts")}>Back to Contacts</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-paper">
            {/* Header */}
            <div className="border-b border-border bg-white px-4 md:px-8 py-5 md:py-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted hover:text-ink mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Contacts</span>
                </button>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                        <Avatar className="w-14 h-14 md:w-16 md:h-16 shrink-0">
                            <AvatarFallback className="bg-accent text-white font-medium text-xl">
                                {getInitials(contact.name || contact.email_address)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-display text-xl md:text-2xl text-ink mb-1 truncate">
                                {contact.name || contact.email_address}
                            </h1>
                            <p className="text-muted mb-3 truncate">{contact.email_address}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                                {contact.last_interaction_at && (
                                    <span>Last seen: {new Date(contact.last_interaction_at).toLocaleDateString()}</span>
                                )}
                                {contact.company && (
                                    <>
                                        <span>•</span>
                                        <span>{contact.company}</span>
                                    </>
                                )}
                                {contact.is_unsubscribed && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-destructive">
                                        Unsubscribed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Button
                            variant={contact.is_unsubscribed ? "default" : "outline"}
                            className={`gap-2 ${!contact.is_unsubscribed ? "text-muted hover:text-destructive" : "bg-primary text-white"}`}
                            onClick={() => toggleUnsubscribe({ contactId: contact.id, email: contact.email_address })}
                            disabled={isUnsubscribing}
                        >
                            {contact.is_unsubscribed ? (
                                <><Bell className="w-4 h-4" /> Resubscribe</>
                            ) : (
                                <><BellOff className="w-4 h-4" /> Unsubscribe</>
                            )}
                        </Button>
                        <Button variant="default" className="gap-2">
                            <Send className="w-4 h-4" />
                            Compose
                        </Button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                <div className="max-w-[1280px] space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:space-y-0">
                    <div className="space-y-6 min-w-0">
                        {/* Stats row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted mb-0.5">Total Interactions</p>
                                    <p className="text-2xl font-bold text-ink">{contact.interaction_count}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted mb-0.5">Received from</p>
                                    <p className="text-2xl font-bold text-ink">
                                        {isLoadingFrom ? "…" : fromThreads.length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <ArrowUpRight className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted mb-0.5">Sent to</p>
                                    <p className="text-2xl font-bold text-ink">
                                        {isLoadingTo ? "…" : toThreads.length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                        </div>

                        {/* Tags */}
                        <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-display text-lg text-ink">Tags & Categories</h2>
                            {!showTagInput ? (
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary"
                                    onClick={() => setShowTagInput(true)}>
                                    <Plus className="w-3 h-3" /> Add Tag
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input
                                        size={1}
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        placeholder="Tag name..."
                                        className="h-7 text-xs w-32 bg-paper"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && newTagName) {
                                                addTag({ contactId: contact.id, name: newTagName });
                                                setNewTagName(""); setShowTagInput(false);
                                            }
                                            if (e.key === "Escape") setShowTagInput(false);
                                        }}
                                    />
                                    <Button variant="ghost" size="icon" className="h-7 w-7"
                                        onClick={() => setShowTagInput(false)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {contact.tags?.map((tag: any) => (
                                <Badge key={tag.id}
                                    style={{ backgroundColor: tag.color_hex || "#E2E8F0", color: "#1E293B" }}
                                    className="flex items-center gap-1.5 px-2 py-1 border-none">
                                    {tag.name}
                                    <button onClick={() => removeTag({ contactId: contact.id, tagId: tag.id })}
                                        className="hover:bg-black/10 rounded-full p-0.5 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                            {contact.tags?.length === 0 && !showTagInput && (
                                <p className="text-sm text-muted italic">No tags assigned yet.</p>
                            )}
                        </div>
                    </div>

                        {/* From this contact */}
                        <ThreadSection
                            title="From this contact"
                            icon={<ArrowDownLeft className="w-4 h-4 text-emerald-500" />}
                            threads={fromThreads}
                            isLoading={isLoadingFrom}
                            emptyText="No emails received from this contact."
                        />

                        {/* To this contact */}
                        <ThreadSection
                            title="To this contact"
                            icon={<ArrowUpRight className="w-4 h-4 text-blue-500" />}
                            threads={toThreads}
                            isLoading={isLoadingTo}
                            emptyText="No emails sent to this contact."
                        />
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
                        <Card className="rounded-2xl shadow-sm p-5">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">AI Intelligence</p>
                                    <h2 className="font-display text-lg text-ink">Relationship signal</h2>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-accent" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="rounded-xl bg-paper-mid/50 border border-border/40 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Engagement</p>
                                    <p className="mt-1 text-sm font-semibold text-ink">{contact.interaction_count} total interactions</p>
                                </div>
                                <div className="rounded-xl bg-paper-mid/50 border border-border/40 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Recent signal</p>
                                    <p className="mt-1 text-sm font-semibold text-ink">
                                        {contact.last_interaction_at ? formatDistanceToNow(new Date(contact.last_interaction_at), { addSuffix: true }) : "No recent activity"}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-paper-mid/50 border border-border/40 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Status</p>
                                    <p className="mt-1 text-sm font-semibold text-ink">
                                        {contact.is_vip ? "Priority relationship" : contact.is_unsubscribed ? "Muted relationship" : "Active relationship"}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}
