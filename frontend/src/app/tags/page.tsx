"use client";

import React, { useState } from "react";
import { Tag, Sparkles, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import AppShell from "@/components/layout/AppShell";
import { useTags, useUpdateTagColor } from "@/hooks/useTags";

const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6",
    "#64748b", "#1e293b",
];

export default function TagsPage() {
    const { data: tags = [], isLoading } = useTags();
    const { mutate: updateColor, isPending } = useUpdateTagColor();
    const [openTagId, setOpenTagId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <AppShell title="Tags">
                <div className="max-w-3xl mx-auto p-6 grid gap-3 sm:grid-cols-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-16 rounded-xl bg-paper-mid animate-pulse" />
                    ))}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Tags" subtitle={`${tags.length} tags`}>
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                {/* Info banner */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-ai/5 border border-ai/20 text-sm text-ink-light">
                    <Sparkles className="h-4 w-4 text-ai shrink-0" />
                    <p>Tags are automatically applied to threads by AI. You can customise their colours here.</p>
                </div>

                {tags.length === 0 ? (
                    <Card className="p-16 text-center text-muted-foreground">
                        <Tag className="h-14 w-14 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No tags yet</p>
                        <p className="text-sm mt-1">Tags appear automatically as your emails are processed by AI.</p>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {tags.map(tag => (
                            <Card
                                key={tag.id}
                                className="p-4 flex items-center gap-3 hover:border-border hover:shadow-sm transition-all"
                            >
                                {/* Color swatch */}
                                <div
                                    className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center"
                                    style={{ backgroundColor: tag.color_hex ?? "#6366f1" }}
                                >
                                    <Tag className="h-4 w-4 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-ink truncate">{tag.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {tag.is_auto_applied && (
                                            <Badge className="text-[10px] px-1.5 py-0 bg-ai/10 text-ai border-ai/20">
                                                AI Applied
                                            </Badge>
                                        )}
                                        {tag.color_hex && (
                                            <span className="text-[10px] font-mono text-muted-foreground">{tag.color_hex}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <Popover
                                    open={openTagId === tag.id}
                                    onOpenChange={(open) => setOpenTagId(open ? tag.id : null)}
                                >
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <Palette className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-3" align="end">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Pick a color</p>
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {PRESET_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    className="h-7 w-7 rounded-md border-2 border-transparent hover:border-white transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                                    style={{ backgroundColor: color, borderColor: tag.color_hex === color ? "white" : undefined }}
                                                    onClick={() => {
                                                        updateColor({ tagId: tag.id, color_hex: color });
                                                        setOpenTagId(null);
                                                    }}
                                                    disabled={isPending}
                                                    aria-label={color}
                                                />
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
