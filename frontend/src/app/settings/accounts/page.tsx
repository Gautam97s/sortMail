"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface ConnectedAccount {
    id: string;
    email: string;
    provider: string;
    status: string;
    sync_status?: string;
    last_sync_at?: string;
    created_at: string;
}

export default function SettingsAccountsPage() {
    const { login } = useAuth();
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading } = useQuery<ConnectedAccount[]>({
        queryKey: ["connected-accounts"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.connectedAccounts);
            return data;
        },
    });

    const syncNow = useMutation({
        mutationFn: (id: string) => api.post(`${endpoints.connectedAccounts}/${id}/sync`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connected-accounts"] }),
    });

    const disconnect = useMutation({
        mutationFn: (id: string) => api.post(`${endpoints.connectedAccounts}/${id}/disconnect`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connected-accounts"] }),
    });

    const statusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": 
                return <div className="px-2 py-0.5 bg-primary-fixed/20 text-primary font-black text-[8px] rounded uppercase tracking-widest border border-primary/5">Active Link</div>;
            case "ERROR": 
                return <div className="px-2 py-0.5 bg-error-container text-error font-black text-[8px] rounded uppercase tracking-widest border border-error/5">Failure</div>;
            case "REVOKED": 
                return <div className="px-2 py-0.5 bg-tertiary-container text-tertiary font-black text-[8px] rounded uppercase tracking-widest border border-tertiary/5">Re-Auth Required</div>;
            default: 
                return <div className="px-2 py-0.5 bg-surface-container text-outline font-black text-[8px] rounded uppercase tracking-widest border border-outline-variant/10">{status}</div>;
        }
    };

    return (
        <div className="max-w-4xl space-y-12">
            <div className="space-y-1">
                <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Intelligence Nodes</h1>
                <p className="text-sm font-medium text-on-surface-variant opacity-80">Synchronize and manage external communication matrices.</p>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2].map(i => <div key={i} className="h-32 rounded-[32px] bg-surface-container-low animate-pulse border border-outline-variant/10" />)}
                </div>
            ) : accounts.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[40px] border border-outline-variant/10 shadow-sm space-y-8 flex flex-col items-center">
                    <div className="h-24 w-24 bg-surface-container rounded-[34px] flex items-center justify-center text-outline-variant">
                        <MaterialSymbol icon="mail_lock" className="text-5xl" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-headline font-bold text-on-surface">No Connected Matrices</h2>
                        <p className="text-sm text-on-surface-variant font-medium max-w-sm">Connect a Google Workspace or Microsoft 365 profile to engage neural syncing.</p>
                    </div>
                    <button 
                        onClick={login}
                        className="h-14 px-10 bg-primary text-on-primary rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <MaterialSymbol icon="cloud_sync" className="text-xl" />
                        Initiate Connection
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {accounts.map(account => (
                        <div key={account.id} className="group bg-white rounded-[32px] border border-outline-variant/10 p-8 flex flex-col md:flex-row md:items-center gap-8 hover:border-primary-fixed hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="h-16 w-16 bg-surface-container rounded-[24px] flex items-center justify-center text-primary border border-outline-variant/10 group-hover:scale-110 transition-transform shadow-inner">
                                    <MaterialSymbol icon={account.provider === 'GMAIL' ? 'mail' : 'alternate_email'} className="text-3xl" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h3 className="font-headline text-lg font-bold text-on-surface truncate tracking-tight">{account.email}</h3>
                                        {statusBadge(account.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-outline-variant uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container rounded">
                                            <MaterialSymbol icon="security" className="text-xs" />
                                            {account.provider === "GMAIL" ? "Google Workspace" : "Microsoft 365"}
                                        </div>
                                        {account.last_sync_at && (
                                            <div className="flex items-center gap-1.5 text-outline tabular-nums">
                                                <MaterialSymbol icon="update" className="text-xs" />
                                                Last Sync: {formatDistanceToNow(new Date(account.last_sync_at), { addSuffix: true })}
                                            </div>
                                        )}
                                    </div>
                                    {account.sync_status === "SYNCING" && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mt-2 animate-pulse">
                                            <MaterialSymbol icon="sync" className="text-xs animate-spin" />
                                            Neural Synapse Active...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => syncNow.mutate(account.id)}
                                    disabled={syncNow.isPending}
                                    className="h-12 px-6 bg-surface-container hover:bg-primary-fixed/20 hover:text-primary rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all border border-outline-variant/10 shadow-sm"
                                >
                                    <MaterialSymbol icon="sync" className={`text-lg ${syncNow.isPending ? "animate-spin" : ""}`} />
                                    Synchronize
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Sever link with ${account.email}?`)) disconnect.mutate(account.id);
                                    }}
                                    className="h-12 w-12 bg-surface-container-high hover:bg-error-container hover:text-error rounded-2xl flex items-center justify-center transition-all border border-outline-variant/10 opacity-60 hover:opacity-100"
                                >
                                    <MaterialSymbol icon="link_off" className="text-xl" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Node Matrix */}
            <div className="p-8 border-2 border-dashed border-outline-variant/15 rounded-[40px] bg-surface-container-lowest/50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white hover:border-primary shadow-sm transition-all">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-on-surface text-surface rounded-2xl flex items-center justify-center">
                        <MaterialSymbol icon="add_circle" className="text-3xl" />
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface tracking-tight">Expand Communication Matrix</h3>
                        <p className="text-sm font-medium text-on-surface-variant opacity-80">Integrate additional neural sources.</p>
                    </div>
                </div>
                <button 
                    onClick={login}
                    className="h-14 px-8 bg-on-surface text-surface rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-black/10 active:scale-[0.98] transition-all"
                >
                    <MaterialSymbol icon="cloud_sync" className="text-xl" />
                    Connect Workspace
                </button>
            </div>

            {/* Security Callout */}
            <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-[32px] flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-white border border-outline-variant/10 flex items-center justify-center text-primary mt-0.5">
                    <MaterialSymbol icon="verified_user" className="text-lg" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-on-surface uppercase tracking-widest">OAuth 2.0 Encrypted Synapse</p>
                    <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed opacity-80">
                        SortMail utilizes direct OAuth 2.0 protocols. We maintain ephemeral access nodes and never store authentication secrets locally. Communication is immutable and processed in a sterile neural environment.
                    </p>
                </div>
            </div>
        </div>
    );
}
