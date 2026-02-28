import React from "react";
import Link from "next/link";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export function SupportHeader() {
    return (
        <div className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link href="/dashboard" className="h-9 w-9 flex items-center justify-center rounded-xl bg-paper-mid text-muted hover:text-ink hover:bg-border transition-all" title="Back to Dashboard">
                        <ArrowLeft size={18} />
                    </Link>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <LifeBuoy size={18} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-ink text-sm sm:text-base">SortMail Support</span>
                    </Link>
                </div>
                <Link href="/help" className="text-sm font-medium text-accent hover:underline">
                    Visit Help Center
                </Link>
            </div>
        </div>
    );
}
