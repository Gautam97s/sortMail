"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="h-24 w-24 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mx-auto mb-6 rotate-12">
                        <Search size={48} />
                    </div>
                    <div className="absolute -top-2 -right-2 h-10 w-10 bg-ai/20 rounded-full flex items-center justify-center text-ai animate-bounce">
                        <Sparkles size={20} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="font-display text-7xl text-ink font-bold tracking-tighter">404</h1>
                    <h2 className="text-2xl font-display text-ink font-semibold">Inbox not found</h2>
                    <p className="text-ink-light leading-relaxed">
                        The page you&apos;re looking for has been archived, deleted, or never existed in the first place.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary gap-2 px-6"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                    <Link href="/" className="btn-primary gap-2 px-6">
                        <Home size={16} />
                        Return Home
                    </Link>
                </div>

                <p className="text-xs text-muted pt-8 italic">
                    Lost? Try checking the URL or search for something else.
                </p>
            </div>
        </div>
    );
}
