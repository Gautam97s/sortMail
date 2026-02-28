"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Users,
    Zap,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Rocket,
    Globe,
    Mail
} from "lucide-react";

export default function InvitePage({ params }: { params: { token: string } }) {
    const [status, setStatus] = useState<"idle" | "joining" | "success">("idle");

    const handleJoin = () => {
        setStatus("joining");
        setTimeout(() => setStatus("success"), 2000);
    };

    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 selection:bg-accent/30 font-body">

            {/* Logo / Branding */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                    <Rocket size={20} />
                </div>
                <span className="font-display font-bold text-2xl text-ink tracking-tight">SortMail</span>
            </div>

            <main className="w-full max-w-xl">
                {status === 'success' ? (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="h-24 w-24 bg-success text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-success/20 rotate-12">
                            <CheckCircle2 size={48} />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-display font-bold text-ink">Welcome to the Team!</h1>
                            <p className="text-lg text-ink-light">
                                You&apos;ve successfully joined the <span className="font-bold text-ink">BuildVerse</span> workspace.
                                Redirecting you to your new dashboard...
                            </p>
                        </div>
                        <Link href="/dashboard" className="btn-primary px-10 py-4 text-lg font-bold shadow-xl shadow-accent/20 inline-flex items-center gap-3">
                            Go to Dashboard
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Invitation Card */}
                        <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-ink/5 border border-border/50 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative z-10 space-y-6">
                                <div className="h-20 w-20 rounded-3xl bg-paper-mid flex items-center justify-center mx-auto mb-8 border border-border group-hover:rotate-6 transition-transform">
                                    <Users size={40} className="text-accent" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-muted uppercase tracking-[0.2em]">Workspace Invitation</p>
                                    <h1 className="text-3xl md:text-5xl font-display font-bold text-ink leading-tight tracking-tight">
                                        BuildVerse invited you to collaborate
                                    </h1>
                                </div>

                                <p className="text-lg text-ink-light max-w-sm mx-auto">
                                    Join <span className="font-bold text-ink">Gautam</span> and 4 others to help master the team&apos;s inbox with AI.
                                </p>

                                <div className="pt-4">
                                    <button
                                        onClick={handleJoin}
                                        disabled={status === 'joining'}
                                        className="w-full btn-primary py-5 text-xl font-bold shadow-2xl shadow-accent/20 flex items-center justify-center gap-4 active:scale-[0.98] transition-all"
                                    >
                                        {status === 'joining' ? (
                                            <>
                                                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Joining Workspace...
                                            </>
                                        ) : (
                                            <>
                                                Join Workspace
                                                <ArrowRight size={24} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="grid grid-cols-3 gap-6">
                            <SmallFeature icon={<Zap size={16} />} label="AI Powered" />
                            <SmallFeature icon={<ShieldCheck size={16} />} label="Secure" />
                            <SmallFeature icon={<Globe size={16} />} label="Team Sync" />
                        </div>

                        <p className="text-center text-sm text-muted">
                            SortMail is used by over 50,000 teams to automate their email workflows.
                            <Link href="/" className="text-accent font-bold ml-1 hover:underline">Learn more</Link>
                        </p>
                    </div>
                )}
            </main>

            {/* Background elements */}
            <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed -top-32 -right-32 w-96 h-96 bg-ai/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}

function SmallFeature({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 text-center group">
            <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent group-hover:bg-accent/5 transition-all">
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-ink transition-colors">{label}</span>
        </div>
    );
}
