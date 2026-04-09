'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type AdminComingSoonProps = {
    title: string;
    description: string;
    backHref?: string;
};

export default function AdminComingSoon({
    title,
    description,
    backHref = '/admin',
}: AdminComingSoonProps) {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Link
                href={backHref}
                className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest"
            >
                <ArrowLeft size={12} /> Admin Home
            </Link>

            <div>
                <h1 className="text-3xl font-display text-ink mb-1">{title}</h1>
                <p className="text-ink-light text-sm">{description}</p>
            </div>

            <Card className="border-border-light shadow-sm">
                <CardContent className="p-10 md:p-14 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-display text-ink">Coming Soon</h2>
                    <p className="text-ink-light text-sm max-w-xl mx-auto">
                        This admin module is being connected to real backend data. We removed placeholder metrics to avoid misleading numbers.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                        <Link href="/admin/metrics">
                            <Button className="text-xs font-bold uppercase tracking-wider h-9">Open Live Metrics</Button>
                        </Link>
                        <Link href="/admin/users">
                            <Button variant="outline" className="text-xs font-bold uppercase tracking-wider h-9 border-border-light">
                                Open User Admin
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
