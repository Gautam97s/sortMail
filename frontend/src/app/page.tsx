"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Paperclip, CheckSquare, FileEdit, Clock, Shield, Menu, X } from "lucide-react";

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <main className="min-h-screen bg-paper">
            {/* Navigation */}
            <nav className="border-b border-border-light/50 sticky top-0 bg-paper/80 backdrop-blur-md z-50">
                <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-6xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <span className="font-display text-xl text-ink">SortMail</span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="btn-ghost text-sm">Features</a>
                        <Link href="/login" className="btn-primary text-sm px-6">
                            Get Started <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 text-ink"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile nav dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-paper border-b border-border-light px-6 py-6 space-y-4 animate-fade-in">
                        <a
                            href="#features"
                            className="block text-lg font-medium text-ink"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Features
                        </a>
                        <Link
                            href="/login"
                            className="btn-primary w-full justify-center text-base py-3"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Get Started <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24 text-center">
                <h1 className="font-display text-4xl md:text-6xl text-ink leading-[1.2] md:leading-[1.1] mb-6 max-w-3xl mx-auto">
                    AI intelligence for your{" "}
                    <span className="italic text-accent">inbox</span>
                </h1>

                <p className="text-base md:text-lg text-ink-light leading-relaxed mb-8 max-w-xl mx-auto">
                    SortMail reads your threads, extracts tasks, summarizes attachments, and drafts replies — so you focus on decisions, not email.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
                        Start Free <ArrowRight size={16} />
                    </Link>
                    <a href="#features" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
                        See How It Works
                    </a>
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-12 text-xs md:text-sm text-muted">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-success" />
                        <span>Read-only OAuth</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-success" />
                        <span>Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-success" />
                        <span>Open source</span>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="max-w-6xl mx-auto px-6 md:px-8 pb-24">
                <div className="text-center mb-12">
                    <span className="section-label">Features</span>
                    <h2 className="font-display text-2xl md:text-3xl text-ink mt-2">Everything your inbox is missing</h2>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<Sparkles size={20} className="text-ai" />}
                        title="Executive Briefings"
                        description="Get 2–3 sentence summaries of any email thread, instantly powered by Gemini AI."
                    />
                    <FeatureCard
                        icon={<Paperclip size={20} className="text-accent" />}
                        title="Attachment Intelligence"
                        description="PDFs, contracts, and spreadsheets summarized with key points extracted automatically."
                    />
                    <FeatureCard
                        icon={<CheckSquare size={20} className="text-success" />}
                        title="Smart Task Extraction"
                        description="Emails auto-converted into prioritized tasks with deadlines and suggested actions."
                    />
                    <FeatureCard
                        icon={<FileEdit size={20} className="text-info" />}
                        title="Draft Copilot"
                        description="AI-generated reply drafts with tone control — professional, friendly, or concise."
                    />
                    <FeatureCard
                        icon={<Clock size={20} className="text-warning" />}
                        title="Follow-up Tracking"
                        description="Know exactly who owes you a response and get automated nudge suggestions."
                    />
                    <FeatureCard
                        icon={<Shield size={20} className="text-success" />}
                        title="Privacy First"
                        description="Read-only access, no auto-send, SOC2 compliant. Your data stays yours."
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border-light py-12 text-center px-6">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6">
                    <Link href="/terms" className="btn-secondary text-xs px-4 py-2">Terms</Link>
                    <Link href="/help" className="btn-secondary text-xs px-4 py-2">Help</Link>
                    <Link href="/status" className="btn-secondary text-xs px-4 py-2">Status</Link>
                    <Link href="/changelog" className="btn-secondary text-xs px-4 py-2">Changelog</Link>
                    <Link href="/privacy" className="btn-secondary text-xs px-4 py-2">Privacy</Link>
                </div>
                <p className="text-xs text-muted">© 2026 SortMail Inc. · All rights reserved.</p>
            </footer>
        </main>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="card p-6">
            <div className="w-10 h-10 rounded-xl bg-paper-mid flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-light leading-relaxed">{description}</p>
        </div>
    );
}
