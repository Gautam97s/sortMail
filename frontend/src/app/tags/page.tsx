"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useTags, useUpdateTagColor } from "@/hooks/useTags";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

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
            <AppShell title="Organizational Intelligence">
                <div className="max-w-4xl mx-auto p-10 grid gap-6 sm:grid-cols-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-24 rounded-[32px] bg-surface-container-low animate-pulse border border-outline-variant/10" />
                    ))}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Organizational Intelligence" subtitle="Autonomous Categorization Matrix">
            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">
                
                {/* Intelligence Callout */}
                <div className="p-6 bg-primary-fixed/10 border border-primary-fixed/20 rounded-[32px] flex items-start gap-5 shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <MaterialSymbol icon="auto_fix" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-headline font-bold text-on-surface">Neural Classification Engine</h3>
                        <p className="text-xs font-medium text-on-surface-variant leading-relaxed opacity-80 italic">
                            SortMail intelligence automatically manifests and applies taxonomies based on semantic thread analysis. Custom tonal identifiers can be modified for visual priority.
                        </p>
                    </div>
                </div>

                {tags.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[40px] border border-outline-variant/10 shadow-sm space-y-6 flex flex-col items-center">
                        <div className="h-20 w-20 bg-surface-container rounded-3xl flex items-center justify-center text-outline-variant">
                            <MaterialSymbol icon="label_off" className="text-4xl" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-headline font-bold text-on-surface">Taxonomy Not Yet Manifested</h2>
                            <p className="text-sm text-on-surface-variant font-medium">Categorization nodes will appear as your neural profile expands.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tags.map(tag => (
                            <div
                                key={tag.id}
                                className="group bg-white rounded-[32px] border border-outline-variant/10 p-6 flex items-center gap-5 hover:border-primary-fixed hover:shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                            >
                                {/* Tag Visual Indicator */}
                                <div
                                    className="h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center shadow-lg border border-white/20 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: tag.color_hex ?? "#6366f1" }}
                                >
                                    <MaterialSymbol icon="label" className="text-2xl text-white" />
                                </div>

                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-base font-headline font-bold text-on-surface truncate tracking-tight">{tag.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {tag.is_auto_applied && (
                                            <div className="px-2 py-0.5 bg-primary-fixed/20 text-primary font-black text-[8px] rounded uppercase tracking-widest flex items-center gap-1.5">
                                                <MaterialSymbol icon="bolt" className="text-[10px]" />
                                                AI Managed
                                            </div>
                                        )}
                                        <span className="text-[10px] font-black text-outline-variant uppercase tracking-tighter tabular-nums opacity-60 group-hover:opacity-100 transition-opacity">
                                            {tag.color_hex}
                                        </span>
                                    </div>
                                </div>

                                {/* Chromatic Controller */}
                                <Popover
                                    open={openTagId === tag.id}
                                    onOpenChange={(open) => setOpenTagId(open ? tag.id : null)}
                                >
                                    <PopoverTrigger asChild>
                                        <button className="h-10 w-10 rounded-xl bg-surface-container flex items-center justify-center text-outline hover:text-primary hover:bg-primary-fixed/20 transition-all border border-outline-variant/5">
                                            <MaterialSymbol icon="palette" className="text-xl" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-4 rounded-[24px] border-outline-variant/10 shadow-2xl bg-white/95 backdrop-blur-xl" align="end">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-outline-variant uppercase tracking-widest px-1">
                                                <MaterialSymbol icon="colorize" className="text-sm" />
                                                Chromatic Scale
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {PRESET_COLORS.map(color => (
                                                    <button
                                                        key={color}
                                                        className={`h-8 w-8 rounded-lg border-2 transition-all hover:scale-110 active:scale-90 ${tag.color_hex === color ? 'border-primary ring-2 ring-primary/20' : 'border-white hover:border-outline-variant/20'}`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => {
                                                            updateColor({ tagId: tag.id, color_hex: color });
                                                            setOpenTagId(null);
                                                        }}
                                                        disabled={isPending}
                                                        aria-label={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
