"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="h-20 w-20 bg-danger/10 rounded-2xl flex items-center justify-center text-danger mx-auto mb-6">
                    <AlertTriangle size={40} />
                </div>

                <div className="space-y-2">
                    <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Something went wrong</h1>
                    <p className="text-ink-light leading-relaxed">
                        We encountered an unexpected error while processing your request. Our team has been notified.
                    </p>
                    {error.digest && (
                        <p className="text-[10px] text-muted font-mono mt-2 opacity-50 uppercase tracking-widest">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={() => reset()}
                        className="btn-primary gap-2 w-full justify-center"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/" className="btn-secondary gap-2 justify-center">
                            <Home size={16} />
                            Home
                        </Link>
                        <a href="mailto:support@sortmail.ai" className="btn-secondary gap-2 justify-center">
                            <Mail size={16} />
                            Support
                        </a>
                    </div>
                </div>

                <div className="pt-8 p-4 bg-paper-mid rounded-xl border border-border-light text-left">
                    <p className="text-[11px] font-medium text-ink uppercase tracking-wider mb-1">Diagnostic Info</p>
                    <p className="text-xs text-ink-light font-mono truncate">
                        {error.message || "Unknown execution error"}
                    </p>
                </div>
            </div>
        </div>
    );
}
