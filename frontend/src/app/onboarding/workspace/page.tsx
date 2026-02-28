"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    ArrowRight,
    ArrowLeft,
    Globe,
    Lock,
    Building2,
    CheckCircle2
} from "lucide-react";

export default function WorkspaceOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [workspaceName, setWorkspaceName] = useState("");
    const [privacy, setPrivacy] = useState<"public" | "private">("private");

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
        else router.push("/onboarding/import");
    };

    return (
        <div className="min-h-screen bg-paper flex font-body">
            {/* Left Side: Progress & Info */}
            <div className="hidden lg:flex w-1/3 bg-ink p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <Users size={18} />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight">SortMail Teams</span>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-display font-bold leading-tight">
                            Build the home for your <span className="italic text-accent">team&apos;s intelligence.</span>
                        </h2>
                        <p className="text-ink-light leading-relaxed">
                            A workspace is where your team collaborates on threads, manages shared tasks, and trains your custom Gemini models.
                        </p>
                    </div>

                    <div className="space-y-6 pt-8">
                        <ProgressStep
                            number={1}
                            title="Workspace Setup"
                            active={step === 1}
                            completed={step > 1}
                        />
                        <ProgressStep
                            number={2}
                            title="Privacy & Access"
                            active={step === 2}
                            completed={step > 2}
                        />
                        <ProgressStep
                            number={3}
                            title="Team Import"
                            active={false}
                            completed={false}
                        />
                    </div>
                </div>

                <div className="relative z-10 text-xs text-ink-light font-mono uppercase tracking-widest">
                    Step {step} of 3
                </div>

                {/* Decorative background */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            </div>

            {/* Right Side: Form */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-paper-mid/30">
                <div className="w-full max-w-md space-y-12">

                    {step === 1 ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-display font-bold text-ink">What&apos;s your workspace called?</h1>
                                <p className="text-ink-light">This is typically your company or department name.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ink" htmlFor="ws-name">Workspace Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                                        <input
                                            autoFocus
                                            type="text"
                                            id="ws-name"
                                            value={workspaceName}
                                            onChange={(e) => setWorkspaceName(e.target.value)}
                                            placeholder="e.g. BuildVerse Design"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-accent outline-none transition-all text-lg font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex gap-4">
                                    <CheckCircle2 size={20} className="text-accent shrink-0 mt-0.5" />
                                    <p className="text-sm text-ink-light leading-relaxed">
                                        Your custom URL will be: <br />
                                        <span className="font-bold text-ink">sortmail.ai/{workspaceName.toLowerCase().replace(/\s+/g, '-') || 'your-team'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-display font-bold text-ink">Privacy & Permissions</h1>
                                <p className="text-ink-light">Choose how your team discovers this workspace.</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setPrivacy('private')}
                                    className={`w-full flex items-start gap-4 p-6 rounded-3xl border transition-all text-left group ${privacy === 'private' ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5' : 'bg-white border-border hover:border-border-deep'}`}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${privacy === 'private' ? 'bg-accent text-white' : 'bg-paper-mid text-muted'}`}>
                                        <Lock size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-ink">Invite Only</h4>
                                        <p className="text-sm text-muted">Only members who are explicitly invited can join.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPrivacy('public')}
                                    className={`w-full flex items-start gap-4 p-6 rounded-3xl border transition-all text-left group ${privacy === 'public' ? 'bg-accent/5 border-accent shadow-lg shadow-accent/5' : 'bg-white border-border hover:border-border-deep'}`}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${privacy === 'public' ? 'bg-accent text-white' : 'bg-paper-mid text-muted'}`}>
                                        <Globe size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-ink">Domain Discoverable</h4>
                                        <p className="text-sm text-muted">Anyone with a @{workspaceName.split(' ')[0].toLowerCase() || 'company'}.com email can join.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-8">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 text-muted font-bold hover:text-ink transition-colors"
                            >
                                <ArrowLeft size={20} />
                                Back
                            </button>
                        ) : <div />}

                        <button
                            disabled={step === 1 && !workspaceName}
                            onClick={handleNext}
                            className="btn-primary px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {step === 2 ? 'Continue to Invites' : 'Next Step'}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProgressStep({ number, title, active, completed }: { number: number, title: string, active: boolean, completed: boolean }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all
                ${completed ? 'bg-accent border-accent text-white' :
                    active ? 'border-accent text-accent' : 'border-white/20 text-white/20'}`}>
                {completed ? '✓' : number}
            </div>
            <span className={`font-bold transition-all ${active ? 'text-white' : completed ? 'text-ink-light' : 'text-white/20'}`}>
                {title}
            </span>
        </div>
    );
}
