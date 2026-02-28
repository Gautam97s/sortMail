'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribePage() {
    const params = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        // Mocking the unsubscribe process
        const timer = setTimeout(() => {
            if (params.token) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [params.token]);

    return (
        <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/5 via-paper to-paper">

            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                    <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-display text-xl text-ink">SortMail</span>
            </div>

            <Card className="w-full max-w-md border-border shadow-2xl bg-paper/80 backdrop-blur-sm">
                <CardContent className="p-10 text-center">
                    {status === 'loading' && (
                        <div className="space-y-6 py-4">
                            <div className="relative mx-auto w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                                <Mail className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-display">Processing request...</h2>
                                <p className="text-sm text-muted-foreground">We&apos;re updating your preferences.</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-success" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-display text-ink">Successfully Unsubscribed</h2>
                                <p className="text-lg text-ink-light">
                                    We&apos;re sorry to see you go! Your email has been removed from our system.
                                </p>
                            </div>
                            <div className="pt-6 space-y-3">
                                <Link href="/" className="block">
                                    <Button className="w-full gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to SortMail
                                    </Button>
                                </Link>
                                <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                    Unsubscribed by mistake? <span className="text-accent underline ml-1 cursor-pointer">Resubscribe</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="h-10 w-10 text-danger" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-display text-ink">Invalid Link</h2>
                                <p className="text-sm text-ink-light leading-relaxed">
                                    This unsubscribe link is invalid or has expired.
                                </p>
                            </div>
                            <div className="pt-6">
                                <Link href="/support">
                                    <Button variant="outline" className="w-full">Contact Support</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <footer className="mt-12 text-center">
                <p className="text-xs text-muted">
                    © 2026 SortMail Inc. · <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                </p>
            </footer>
        </main>
    );
}
