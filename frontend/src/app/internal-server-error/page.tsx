'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InternalServerErrorPage() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-danger/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-md w-full space-y-8">
                {/* Icon Circle */}
                <div className="mx-auto w-20 h-20 rounded-3xl bg-danger/10 flex items-center justify-center border border-danger/20 shadow-lg shadow-danger/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <AlertCircle size={40} className="text-danger" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-display text-ink tracking-tight">System Hiccup</h1>
                    <p className="text-ink-light text-sm leading-relaxed">
                        Something went wrong on our end. We&apos;ve logged the error and our engineers are looking into it.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4">
                    <Button
                        onClick={handleRefresh}
                        className="h-12 bg-danger hover:bg-danger-deep text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-danger/20"
                    >
                        <RefreshCw size={16} className="mr-2" /> Try Refreshing
                    </Button>

                    <div className="flex gap-3">
                        <Link href="/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full h-12 border-border-light text-ink text-xs font-bold uppercase tracking-wider hover:bg-paper-mid transition-all">
                                <ArrowLeft size={16} className="mr-2" /> Back Home
                            </Button>
                        </Link>
                        <Link href="/support" className="flex-1">
                            <Button variant="outline" className="w-full h-12 border-border-light text-ink text-xs font-bold uppercase tracking-wider hover:bg-paper-mid transition-all">
                                <LifeBuoy size={16} className="mr-2" /> Support
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="pt-8 opacity-40">
                    <p className="text-[10px] font-mono font-bold text-ink-light uppercase tracking-[0.2em]">Error Code: 500_INTERNAL_SERVER_ERROR</p>
                </div>
            </div>
        </div>
    );
}
