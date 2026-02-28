"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Link from "next/link";

export default function SupportForm() {
    const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("sending");
        setTimeout(() => setFormStatus("sent"), 1500);
    };

    if (formStatus === 'sent') {
        return (
            <div className="card p-8 md:p-10 shadow-xl shadow-ink/5 border-border/50 bg-white/80 backdrop-blur-md text-center py-12 space-y-6">
                <div className="h-20 w-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-display font-bold text-ink">Message Sent!</h2>
                    <p className="text-zinc-400 text-sm">
                        Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
                    </p>
                </div>
                <button
                    onClick={() => setFormStatus('idle')}
                    className="btn-secondary px-8 py-3"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="card p-8 md:p-10 shadow-xl shadow-ink/5 border-border/50 bg-white/80 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-ink" htmlFor="name">Full Name</label>
                        <input
                            required
                            type="text"
                            id="name"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-paper focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-ink" htmlFor="email">Work Email</label>
                        <input
                            required
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-paper focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted"
                            placeholder="jane@company.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-ink" htmlFor="subject">Subject</label>
                    <select
                        id="subject"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-paper focus:ring-2 focus:ring-accent outline-none transition-all"
                    >
                        <option>Technical Issue</option>
                        <option>Billing Inquiry</option>
                        <option>Feature Request</option>
                        <option>Account Access</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-ink" htmlFor="message">Message</label>
                    <textarea
                        required
                        id="message"
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-paper focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-muted resize-none"
                        placeholder="How can we help? Please be as descriptive as possible..."
                    ></textarea>
                </div>

                <button
                    disabled={formStatus === 'sending'}
                    type="submit"
                    className="w-full btn-primary py-4 text-lg font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                    {formStatus === 'sending' ? (
                        <>
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Send Message
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-muted leading-relaxed">
                    By submitting this form, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link>.
                    We usually respond within 1 business day.
                </p>
            </form>
        </div>
    );
}
