'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribeBasePage() {
    return (
        <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
            <div className="flex items-center gap-2 mb-12">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-display text-xl text-ink">SortMail</span>
            </div>

            <Card className="w-full max-w-md border-border shadow-xl">
                <CardContent className="p-10 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-8 w-8 text-warning" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-display text-ink">Missing Unsubscribe Token</h2>
                        <p className="text-ink-light leading-relaxed">
                            To protect your security, we can only process unsubscriptions via direct links sent to your inbox. Please use the &quot;Unsubscribe&quot; link found at the bottom of any SortMail briefing.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Link href="/">
                            <Button className="w-full gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
