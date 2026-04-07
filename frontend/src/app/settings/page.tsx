'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api, endpoints } from '@/lib/api';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function SettingsPage() {
    const { user, checkSession } = useAuth();
    const nameRef = useRef<HTMLInputElement>(null);
    const [saved, setSaved] = useState(false);
    const queryClient = useQueryClient();

    const updateProfile = useMutation({
        mutationFn: (name: string) =>
            api.patch(endpoints.updateProfile, { name }),
        onSuccess: async () => {
            await checkSession();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        },
    });

    const handleSave = () => {
        const name = nameRef.current?.value?.trim();
        if (name) updateProfile.mutate(name);
    };

    const initials = user?.name
        ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <div className="space-y-10 pb-20 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-on-surface">Account Overview</h1>
                <p className="text-on-surface-variant mt-1.5 font-medium">Manage your profile, intelligence preferences, and connected ecosystems.</p>
            </div>

            {/* Profile Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <MaterialSymbol icon="person" className="text-primary text-2xl" />
                    <h2 className="font-headline text-xl text-on-surface font-bold">Personal Profile</h2>
                </div>

                <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="relative group shrink-0">
                            <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-primary-fixed/20 border-4 border-white shadow-lg transition-transform group-hover:scale-105">
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name || "User"} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-primary-fixed flex items-center justify-center text-primary text-2xl font-bold font-headline">
                                        {initials}
                                    </div>
                                )}
                            </div>
                            <button className="absolute -bottom-1 -right-1 p-2 bg-primary text-on-primary rounded-xl shadow-lg border-2 border-white scale-90 hover:scale-100 transition-transform">
                                <MaterialSymbol icon="edit" className="text-sm" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 w-full">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-outline uppercase tracking-wider pl-1">Display Name</label>
                                    <input 
                                        ref={nameRef}
                                        type="text" 
                                        defaultValue={user?.name || ""} 
                                        className="w-full h-11 px-4 bg-surface-container-lowest border border-outline-variant/15 rounded-xl focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all font-medium text-on-surface"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-outline uppercase tracking-wider pl-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        defaultValue={user?.email || ""} 
                                        disabled 
                                        className="w-full h-11 px-4 bg-surface-container text-on-surface-variant border border-outline-variant/10 rounded-xl font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-primary-fixed/20 text-primary text-[10px] font-bold rounded-full border border-primary/10 uppercase tracking-wide flex items-center gap-1.5">
                                        <MaterialSymbol icon="verified" className="text-sm" />
                                        {user?.provider || "Google"} SSO
                                    </div>
                                    {user?.credits !== undefined && (
                                        <div className="px-3 py-1 bg-tertiary-fixed/20 text-tertiary text-[10px] font-bold rounded-full border border-tertiary/10 uppercase tracking-wide">
                                            {user.credits} Intelligence Credits
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {saved && <span className="text-primary text-sm font-bold flex items-center gap-1"><MaterialSymbol icon="check_circle" className="text-sm" /> Changes Saved</span>}
                                    <button 
                                        onClick={handleSave} 
                                        disabled={updateProfile.isPending}
                                        className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                                    >
                                        {updateProfile.isPending ? <MaterialSymbol icon="sync" className="animate-spin" /> : <MaterialSymbol icon="save" />}
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <MaterialSymbol icon="mail" className="text-primary text-2xl" />
                    <h2 className="font-headline text-xl text-on-surface font-bold">Inbox Integrations</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Gmail */}
                    <div className="group bg-white rounded-3xl border-2 border-primary-fixed p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="px-2.5 py-1 bg-primary-fixed text-primary font-bold text-[9px] rounded-full uppercase tracking-tighter">Active</div>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 bg-white rounded-2xl border border-outline-variant/15 flex items-center justify-center p-2.5 shadow-inner">
                                <Image src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png" alt="Gmail" width={32} height={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface">Google Workspace</h3>
                                <p className="text-xs text-on-surface-variant font-medium">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                            <div className="flex items-center gap-2.5">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-9 h-5 bg-surface-container rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">Intelligent Syncing</span>
                            </div>
                            <button className="text-xs font-bold text-primary hover:underline">Settings</button>
                        </div>
                    </div>

                    {/* Outlook */}
                    <div className="group bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-6 opacity-80 hover:opacity-100 hover:border-primary-fixed/30 transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 bg-white rounded-2xl border border-outline-variant/15 flex items-center justify-center p-2.5">
                                <Image src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" width={32} height={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface">Microsoft Outlook</h3>
                                <p className="text-xs text-on-surface-variant font-medium italic">Not connected</p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-surface-container-high hover:bg-primary-fixed/20 text-on-surface font-bold rounded-xl text-sm transition-all border border-outline-variant/10 flex items-center justify-center gap-2">
                            <MaterialSymbol icon="add" className="text-lg" />
                            Connect Account
                        </button>
                    </div>
                </div>
            </section>

            {/* AI Configuration */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <MaterialSymbol icon="psychology" className="text-primary text-2xl" />
                    <h2 className="font-headline text-xl text-on-surface font-bold">Cognitive Intelligence</h2>
                </div>

                <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden divide-y divide-outline-variant/5">
                    <AIControlToggle 
                        title="Draft Autopilot" 
                        desc="Automatically generate smart drafts for incoming priority threads using your tonal profile." 
                        icon="edit_note"
                        defaultChecked
                    />
                    <AIControlToggle 
                        title="Sentiment & Intent Analysis" 
                        desc="Deep-scan communications for emotional context and underlying action items." 
                        icon="sentiment_satisfied"
                        defaultChecked
                    />
                    <AIControlToggle 
                        title="Relationship Prioritization" 
                        desc="Boost visibility of threads from high-value stakeholders and frequent collaborators." 
                        icon="star"
                        defaultChecked
                    />
                </div>
            </section>

            {/* Support Links */}
            <section className="grid gap-4 md:grid-cols-4">
                <SupportLink icon="help_center" title="Help Center" href="/help" />
                <SupportLink icon="chat" title="Contact Us" href="/support" />
                <SupportLink icon="health_and_safety" title="System Health" href="/status" />
                <SupportLink icon="new_releases" title="Changelog" href="/changelog" />
            </section>
        </div>
    );
}

function AIControlToggle({ title, desc, icon, defaultChecked = false }: { title: string, desc: string, icon: string, defaultChecked?: boolean }) {
    return (
        <div className="p-6 flex items-start gap-5 hover:bg-surface-container-lowest transition-colors">
            <div className="h-10 w-10 bg-primary-fixed/20 text-primary rounded-xl flex items-center justify-center shrink-0">
                <MaterialSymbol icon={icon} />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-on-surface">{title}</h3>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-lg mt-0.5">{desc}</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer mt-1">
                <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:bg-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </div>
        </div>
    );
}

function SupportLink({ title, icon, href }: { title: string, icon: string, href: string }) {
    return (
        <Link href={href} className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl flex flex-col items-center gap-3 group hover:border-primary-fixed hover:shadow-lg transition-all">
            <div className="h-10 w-10 bg-surface-container text-outline group-hover:bg-primary-fixed/20 group-hover:text-primary rounded-xl flex items-center justify-center transition-all">
                <MaterialSymbol icon={icon} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface">{title}</span>
        </Link>
    );
}
