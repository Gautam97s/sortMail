"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, Clock, ArrowLeft, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useContact, useContactThreads, useToggleUnsubscribe, useAddContactTag, useRemoveContactTag } from "@/hooks/useContacts";
import { formatDistanceToNow } from "date-fns";
import { Plus, X, Bell, BellOff } from "lucide-react";

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const email = decodeURIComponent(params.email as string);

    const { data: contact, isLoading: isLoadingContact } = useContact(email);
    const { data: contactThreads = [], isLoading: isLoadingThreads } = useContactThreads(contact?.id || "");

    const { mutate: toggleUnsubscribe, isPending: isUnsubscribing } = useToggleUnsubscribe();
    const { mutate: addTag, isPending: isAddingTag } = useAddContactTag();
    const { mutate: removeTag } = useRemoveContactTag();

    const [newTagName, setNewTagName] = React.useState("");
    const [showTagInput, setShowTagInput] = React.useState(false);

    const isLoading = isLoadingContact || isLoadingThreads;

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
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
            <div className="border-b border-border bg-white px-8 py-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted hover:text-ink mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Contacts</span>
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-accent text-white font-medium text-xl">
                                {getInitials(contact.name || contact.email_address)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-display text-2xl text-ink mb-1">
                                {contact.name || contact.email_address}
                            </h1>
                            <p className="text-muted mb-3">{contact.email_address}</p>
                            <div className="flex items-center gap-4 text-xs text-muted">
                                {contact.last_interaction_at && (
                                    <span>Last interaction: {new Date(contact.last_interaction_at).toLocaleDateString()}</span>
                                )}
                                {contact.company && (
                                    <>
                                        <span>•</span>
                                        <span>{contact.company}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={contact.is_unsubscribed ? "default" : "outline"}
                            className={`gap-2 ${!contact.is_unsubscribed ? "text-muted hover:text-primary" : "bg-primary text-white"}`}
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

            {/* Stats & Thread History */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-5xl space-y-6">
                    {/* Email Stats */}
                    <div>
                        <h2 className="font-display text-lg text-ink mb-3">Interactions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Total Interactions</p>
                                        <p className="text-2xl font-bold text-ink">
                                            {contact.interaction_count}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-ai-purple/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-ai-purple" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-0.5">Last Seen</p>
                                        <p className="text-lg font-bold text-ink">
                                            {contact.last_interaction_at ? formatDistanceToNow(new Date(contact.last_interaction_at), { addSuffix: true }) : "Never"}
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-primary"
                                    onClick={() => setShowTagInput(true)}
                                >
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
                                            if (e.key === 'Enter' && newTagName) {
                                                addTag({ contactId: contact.id, name: newTagName });
                                                setNewTagName("");
                                                setShowTagInput(false);
                                            }
                                            if (e.key === 'Escape') setShowTagInput(false);
                                        }}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setShowTagInput(false)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {contact.tags?.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    style={{ backgroundColor: tag.color_hex || '#E2E8F0', color: '#1E293B' }}
                                    className="flex items-center gap-1.5 px-2 py-1 border-none"
                                >
                                    {tag.name}
                                    <button
                                        onClick={() => removeTag({ contactId: contact.id, tagId: tag.id })}
                                        className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                            {contact.tags?.length === 0 && !showTagInput && (
                                <p className="text-sm text-muted italic">No tags assigned yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Thread History */}
                    <div className="min-h-[300px]">
                        <h2 className="font-display text-lg text-ink mb-3">Recent Threads</h2>
                        {isLoadingThreads ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-[90px] bg-paper-mid animate-pulse rounded-xl border border-border-light" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {contactThreads.map((thread) => (
                                    <Link key={thread.thread_id} href={`/inbox/${thread.thread_id}`}>
                                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-ink truncate mb-1">
                                                        {thread.subject}
                                                    </h3>
                                                    <p className="text-sm text-muted line-clamp-2 mb-2">
                                                        {thread.summary}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`text-xs ${getIntentColor(thread.intent)}`}
                                                        >
                                                            {thread.intent.replace("_", " ")}
                                                        </Badge>
                                                        <span className="text-xs text-muted">
                                                            {new Date(thread.last_updated).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                                {contactThreads.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-lg">No recent threads found with this contact.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
