'use client';

import { Sparkles, Hammer, Clock, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
    return (
        <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-warning/10 via-paper to-paper">

            {/* Logo */}
            <div className="flex items-center gap-2 mb-12 animate-in fade-in duration-1000">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-display text-xl text-ink">SortMail</span>
            </div>

            <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Visual */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-warning/20 rounded-full animate-ping duration-1000" />
                    <div className="relative bg-white border border-warning/30 w-full h-full rounded-2xl flex items-center justify-center shadow-xl">
                        <Hammer className="h-10 w-10 text-warning animate-bounce" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="font-display text-4xl md:text-5xl text-ink">Scheduled Tuning</h1>
                    <p className="text-ink-light text-sm max-w-xs mx-auto leading-relaxed">
                        We&apos;re currently performing essential database optimizations. Your inbox is still safe, we&apos;ll be back in just a few minutes.
                    </p>
                </div>

                {/* Status Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-white/50 backdrop-blur-sm space-y-1">
                        <div className="flex items-center justify-center gap-2 text-warning">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">Estimated Return</span>
                        </div>
                        <p className="font-display text-lg">1:00 PM EST</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-white/50 backdrop-blur-sm space-y-1">
                        <div className="flex items-center justify-center gap-2 text-success">
                            <Globe className="h-4 w-4" />
                            <span className="text-xs font-mono uppercase tracking-wider">System Status</span>
                        </div>
                        <p className="font-display text-lg text-success">Scaling Core</p>
                    </div>
                </div>

                <div className="pt-6 space-y-4">
                    <Link href="https://status.sortmail.ai" target="_blank">
                        <Button variant="outline" className="gap-2">
                            Check Real-time Status <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono">
                        Stay updated on our <Link href="/changelog" className="text-accent hover:underline">Changelog</Link>
                    </p>
                </div>
            </div>

            <footer className="mt-16 text-center text-xs text-muted font-mono">
                © 2026 SortMail Inc. · We appreciate your patience.
            </footer>
        </main>
    );
}
