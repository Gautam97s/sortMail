"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBinItems, usePurgeBinItem, useRestoreBinItem, type BinItem } from '@/hooks/useBin';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

const ENTITY_META: Record<string, { icon: string; label: string }> = {
    thread: { icon: 'mail', label: 'Thread' },
    task: { icon: 'checklist', label: 'Task' },
    draft: { icon: 'edit_document', label: 'Draft' },
    workflow_reminder: { icon: 'schedule', label: 'Workflow' },
};

function BinRow({ item, onRestore, onPurge, busyRestore, busyPurge }: {
    item: BinItem;
    onRestore: (id: string) => void;
    onPurge: (id: string) => void;
    busyRestore: boolean;
    busyPurge: boolean;
}) {
    const meta = ENTITY_META[item.entity_type] || { icon: 'delete', label: item.entity_type };
    const expiresAt = new Date(item.restore_until);

    return (
        <div className="bg-white border border-outline-variant/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center">
                    <MaterialSymbol icon={meta.icon} className="text-xl" />
                </div>
                <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-widest text-outline">{meta.label}</div>
                    <div className="text-sm font-bold text-on-surface truncate">{item.entity_label || item.entity_id}</div>
                    <div className="text-xs text-on-surface-variant">Restore until {expiresAt.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onRestore(item.id)}
                    disabled={busyRestore}
                    className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-60"
                >
                    {busyRestore ? 'Restoring...' : 'Restore'}
                </button>
                <button
                    onClick={() => onPurge(item.id)}
                    disabled={busyPurge}
                    className="px-3 py-2 rounded-xl bg-error text-on-error text-xs font-bold disabled:opacity-60"
                >
                    {busyPurge ? 'Deleting...' : 'Delete Forever'}
                </button>
            </div>
        </div>
    );
}

export default function BinPage() {
    const { data, isLoading, error } = useBinItems();
    const restore = useRestoreBinItem();
    const purge = usePurgeBinItem();

    return (
        <AppShell title="Universal Bin" subtitle="Restore within 30 days before permanent purge">
            <div className="max-w-[1100px] mx-auto p-4 md:p-6 space-y-4">
                <div className="bg-white border border-outline-variant/10 rounded-2xl p-4">
                    <h1 className="text-lg font-headline font-bold text-on-surface">Deleted Items</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Items stay here for 30 days. You can restore or permanently delete anytime.</p>
                </div>

                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />)}
                    </div>
                )}

                {error && (
                    <div className="bg-error-container/20 border border-error/25 rounded-2xl p-4 text-error font-semibold">
                        Failed to load bin items.
                    </div>
                )}

                {!isLoading && !error && (data?.length || 0) === 0 && (
                    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 text-center text-on-surface-variant">
                        Bin is empty.
                    </div>
                )}

                <div className="space-y-3">
                    {(data || []).map((item) => (
                        <BinRow
                            key={item.id}
                            item={item}
                            onRestore={(id) => restore.mutate(id)}
                            onPurge={(id) => purge.mutate(id)}
                            busyRestore={restore.isPending && restore.variables === item.id}
                            busyPurge={purge.isPending && purge.variables === item.id}
                        />
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
