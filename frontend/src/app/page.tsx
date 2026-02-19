import Link from "next/link";
import { ArrowRight, Sparkles, Paperclip, CheckSquare, FileEdit, Clock, Shield } from "lucide-react";

export default function Home() {
    return (
        <main className="min-h-screen bg-paper">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="font-display text-xl text-ink">SortMail</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="#features" className="btn-ghost text-sm">Features</a>
                    <Link href="/login" className="btn-primary text-sm">
                        Get Started <ArrowRight size={14} />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-8 py-24 text-center">
                <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.1] mb-6 max-w-3xl mx-auto">
                    AI intelligence for your{" "}
                    <span className="italic text-accent">inbox</span>
                </h1>

                <p className="text-lg text-ink-light leading-relaxed mb-8 max-w-xl mx-auto">
                    SortMail reads your threads, extracts tasks, summarizes attachments, and drafts replies — so you focus on decisions, not email.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/login" className="btn-primary text-base px-8 py-3">
                        Start Free <ArrowRight size={16} />
                    </Link>
                    <a href="#features" className="btn-secondary text-base px-8 py-3">
                        See How It Works
                    </a>
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-success" />
                        <span>Read-only OAuth</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-success" />
                        <span>End-to-end encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-success" />
                        <span>Open source</span>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="max-w-6xl mx-auto px-8 pb-24">
                <div className="text-center mb-12">
                    <span className="section-label">Features</span>
                    <h2 className="font-display text-3xl text-ink mt-2">Everything your inbox is missing</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
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
            <footer className="border-t border-border-light py-8 text-center text-xs text-muted">
                <p>© 2026 SortMail Inc. · <a href="#" className="hover:text-ink-light underline">Terms</a> · <a href="#" className="hover:text-ink-light underline">Privacy</a></p>
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
