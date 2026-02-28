"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Key, Smartphone, HelpCircle } from "lucide-react";

export default function TwoFactorPage() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value !== "" && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && code[index] === "" && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Two-factor Authentication</h1>
                    <p className="text-ink-light mt-2">
                        Enter the 6-digit code from your authenticator app to secure your session.
                    </p>
                </div>

                <div className="card p-8 space-y-8">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-paper-mid border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none"
                            />
                        ))}
                    </div>

                    <button className="btn-primary w-full py-3 justify-center text-base">
                        Verify & Login
                        <ArrowRight size={18} />
                    </button>

                    <div className="flex flex-col gap-4 pt-4 border-t border-border-light">
                        <button className="flex items-center gap-3 text-sm text-ink-light hover:text-accent transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-paper-mid flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                <Key size={14} />
                            </div>
                            Enter a backup recovery code
                        </button>
                        <button className="flex items-center gap-3 text-sm text-ink-light hover:text-accent transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-paper-mid flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                                <HelpCircle size={14} />
                            </div>
                            I&apos;ve lost access to my device
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-muted mt-8">
                    Not you? <Link href="/login" className="text-accent hover:underline font-medium">Log out</Link>
                </p>
            </div>
        </div>
    );
}
