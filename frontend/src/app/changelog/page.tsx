"use client";

import React from "react";
import Link from "next/link";
import {
    Sparkles,
    Zap,
    ShieldCheck,
    Cpu,
    Bug,
    Rocket,
    ArrowLeft,
    Calendar,
    ChevronRight,
    Star
} from "lucide-react";

export default function ChangelogPage() {
    const logs = [
        {
            version: "v1.2.0",
            date: "February 27, 2026",
            title: "The Intelligence Update",
            description: "Deepening our Gemini integration to provide more nuanced thread analysis and smarter multi-recipient draft generation.",
            updates: [
                { type: "new", label: "Multi-Recipient Support", desc: "AI can now intelligently handle 'CC' and 'BCC' recipients in draft generation.", icon: <Sparkles size={14} /> },
                { type: "improved", label: "Contract Extraction", desc: "Improved entity detection for complex legal and payment terms in PDF attachments.", icon: <ShieldCheck size={14} /> },
                { type: "fix", label: "Sidebar Jumpiness", desc: "Fixed a layout shift when toggling the sidebar on smaller screens.", icon: <Bug size={14} /> },
            ]
        },
        {
            version: "v1.1.5",
            date: "February 15, 2026",
            title: "Performance & Polish",
            description: "A focused update targeting dashboard responsiveness and loading optimizations.",
            updates: [
                { type: "improved", label: "Sync Speed", desc: "Background email synchronization is now 40% faster using our new queue architecture.", icon: <Zap size={14} /> },
                { type: "new", label: "Dark Mode Preview", desc: "Early access to our premium high-contrast theme (Settings > Appearance).", icon: <Cpu size={14} /> },
                { type: "fix", label: "Mobile Nav Layout", desc: "Corrected overlapping icons on mobile dashboard view.", icon: <Bug size={14} /> },
            ]
        },
        {
            version: "v1.1.0",
            date: "February 01, 2026",
            title: "Team Collaboration Beta",
            description: "First step toward shared workspaces and team-based task management.",
            updates: [
                { type: "new", label: "Team Invites", desc: "Invite colleagues to your workspace and assign threads to specific members.", icon: <Rocket size={14} /> },
                { type: "new", label: "Shared Tasks", desc: "Collaborate on extracted tasks from high-priority client threads.", icon: <Star size={14} /> },
                { type: "improved", label: "Email Filtering", desc: "More granular control over which threads get processed by the AI engine.", icon: <Zap size={14} /> },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-paper">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="group">
                            <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                <Rocket size={20} />
                            </div>
                        </Link>
                        <div>
                            <h1 className="font-display font-bold text-xl text-ink">Changelog</h1>
                            <p className="text-xs text-muted font-bold tracking-widest uppercase">Latest Updates</p>
                        </div>
                    </div>
                    <Link href="/" className="btn-secondary text-sm px-5 py-2">
                        Back to App
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">

                {/* Hero */}
                <div className="mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight">
                        What&apos;s new in <span className="italic text-accent">SortMail</span>
                    </h2>
                    <p className="text-lg text-ink-light leading-relaxed max-w-2xl">
                        We&apos;re constantly shipping improvements to help you master your inbox.
                        Subscribe to our newsletter to get these updates in your briefing.
                    </p>
                </div>

                {/* Timeline */}
                <div className="space-y-24 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
                    {logs.map((log, logIdx) => (
                        <section key={log.version} className="relative pl-14">
                            {/* Version Dot */}
                            <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-white border-2 border-accent flex items-center justify-center text-accent z-10 shadow-lg shadow-accent/5">
                                <span className="text-[10px] font-bold font-mono">{log.version}</span>
                            </div>

                            <div className="space-y-8">
                                {/* Date and Title */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted">
                                        <Calendar size={14} />
                                        <time className="text-sm font-bold font-mono uppercase tracking-wider">{log.date}</time>
                                    </div>
                                    <h3 className="text-3xl font-display font-bold text-ink leading-tight">
                                        {log.title}
                                    </h3>
                                    <p className="text-lg text-ink-light leading-relaxed max-w-3xl">
                                        {log.description}
                                    </p>
                                </div>

                                {/* Update Cards */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {log.updates.map((update, updateIdx) => (
                                        <div key={updateIdx} className="card p-5 bg-white border-border/40 hover:border-accent/20 transition-all hover:shadow-xl hover:shadow-ink/5 group">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 
                                                    ${update.type === 'new' ? 'bg-ai/10 text-ai' :
                                                        update.type === 'improved' ? 'bg-accent/10 text-accent' :
                                                            'bg-danger/10 text-danger'}`}>
                                                    {update.icon}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest
                                                            ${update.type === 'new' ? 'text-ai' :
                                                                update.type === 'improved' ? 'text-accent' :
                                                                    'text-danger'}`}>
                                                            {update.type}
                                                        </span>
                                                        <h4 className="font-bold text-ink text-sm">{update.label}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted leading-relaxed">
                                                        {update.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-32 p-12 bg-accent/5 border border-accent/20 rounded-[3rem] text-center space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} className="text-accent" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <h3 className="text-3xl font-display font-bold text-ink">Have a feature request?</h3>
                        <p className="text-ink-light max-w-md mx-auto">
                            We build SortMail based on your feedback. Tell us what you&apos;d like to see in the next update.
                        </p>
                    </div>
                    <Link href="/support" className="btn-primary px-10 py-4 text-lg font-bold shadow-xl shadow-accent/20 relative z-10 inline-flex">
                        Request a Feature
                    </Link>
                </div>

            </main>

            <footer className="py-20 border-t border-border mt-32 text-center space-y-6">
                <div className="flex justify-center gap-8">
                    <Link href="/terms" className="text-xs text-muted font-bold uppercase tracking-widest hover:text-ink transition-colors">Terms</Link>
                    <Link href="/privacy" className="text-xs text-muted font-bold uppercase tracking-widest hover:text-ink transition-colors">Privacy</Link>
                    <Link href="/help" className="text-xs text-muted font-bold uppercase tracking-widest hover:text-ink transition-colors">Help</Link>
                </div>
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest">
                    © 2026 SortMail Inc. · Handcrafted in San Francisco
                </p>
            </footer>
        </div>
    );
}
