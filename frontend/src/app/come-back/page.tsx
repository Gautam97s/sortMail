'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Zap, Mail, Shield, CheckCircle2 } from 'lucide-react';

export default function ComeBackPage() {
    return (
        <main className="min-h-screen bg-paper overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-ai/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-4xl mx-auto px-8 py-24 relative z-10 flex flex-col items-center text-center">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-xl shadow-accent/20">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <span className="font-display text-2xl text-ink">SortMail</span>
                </div>

                <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                    <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.1]">
                        Welcome <span className="italic text-accent underline decoration-accent/20">back</span>
                    </h1>

                    <p className="text-xl text-ink-light leading-relaxed">
                        We&apos;ve missed you! Since you&apos;ve been gone, we&apos;ve upgraded our AI models to Gemini 2.0, making inbox intelligence faster and more precise than ever.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center pt-8">
                        <Link href="/login">
                            <Button className="btn-primary px-8 py-6 text-lg h-auto gap-2 group shadow-lg shadow-accent/20">
                                Log in to your Dashboard
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* What's New Section */}
                <div className="mt-24 grid md:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <FeatureBox
                        icon={<Zap className="text-ai" />}
                        title="3x Faster Sync"
                        description="Our new streaming engine syncs thousands of emails in seconds."
                    />
                    <FeatureBox
                        icon={<Mail className="text-accent" />}
                        title="Smart Drafts"
                        description="AI now learns your writing style for even more natural replies."
                    />
                    <FeatureBox
                        icon={<Shield className="text-success" />}
                        title="Enhanced Privacy"
                        description="New on-device processing for sensitive email metadata."
                    />
                </div>

                {/* Re-engagement Offer */}
                <div className="mt-16 p-1 bg-gradient-to-r from-accent/20 via-ai/20 to-accent/20 rounded-2xl w-full max-w-xl animate-in fade-in zoom-in duration-1000 delay-700">
                    <div className="bg-paper rounded-[15px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-left">
                            <h3 className="text-lg font-display flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
                                Special Offer for Returners
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Get 500 bonus AI credits when you log in today.</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 text-accent font-mono font-bold">
                            CLAIM NOW <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <p className="mt-24 text-xs text-muted font-mono tracking-widest uppercase">
                    Your Inbox, Finally Under Control Since 2026.
                </p>
            </div>
        </main>
    );
}

function FeatureBox({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl border border-border bg-paper/50 backdrop-blur-sm hover:border-accent/40 transition-all hover:-translate-y-1 text-left">
            <div className="w-10 h-10 rounded-lg bg-paper-mid flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-display text-lg mb-2">{title}</h3>
            <p className="text-sm text-ink-light leading-relaxed">{description}</p>
        </div>
    );
}
