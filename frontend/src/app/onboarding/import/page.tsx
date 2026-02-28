"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    ArrowRight,
    ArrowLeft,
    Mail,
    Upload,
    CheckCircle2,
    Plus,
    X,
    Sparkles
} from "lucide-react";

export default function TeamImportPage() {
    const router = useRouter();
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    const addEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentEmail && !emails.includes(currentEmail)) {
            setEmails([...emails, currentEmail]);
            setCurrentEmail("");
        }
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const handleFinish = () => {
        setIsImporting(true);
        setTimeout(() => {
            router.push("/workspace");
        }, 2000);
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
                            Invite your <span className="italic text-accent">collaborators.</span>
                        </h2>
                        <p className="text-ink-light leading-relaxed">
                            SortMail works best when your whole team is connected. You can always invite more people later from your workspace settings.
                        </p>
                    </div>

                    <div className="space-y-6 pt-8">
                        <ProgressStep number={1} title="Workspace Setup" completed />
                        <ProgressStep number={2} title="Privacy & Access" completed />
                        <ProgressStep number={3} title="Team Import" active />
                    </div>
                </div>

                <div className="relative z-10 text-xs text-ink-light font-mono uppercase tracking-widest">
                    Step 3 of 3
                </div>

                {/* Decorative background */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Right Side: Form */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 bg-paper-mid/30">
                <div className="w-full max-w-md space-y-12">

                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-display text-ink">Who&apos;s joining you?</h2>
                            <p className="text-ink-light mb-8">Invite your team to get the most out of SortMail.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Manual Entry */}
                            <form onSubmit={addEmail} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ink" htmlFor="email-entry">Invite by Email</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                            <input
                                                type="email"
                                                id="email-entry"
                                                value={currentEmail}
                                                onChange={(e) => setCurrentEmail(e.target.value)}
                                                placeholder="teammate@company.com"
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-accent outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn-secondary h-12 w-12 flex items-center justify-center rounded-xl shrink-0"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Email List */}
                                <div className="flex flex-wrap gap-2">
                                    {emails.map((email) => (
                                        <div key={email} className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full border border-accent/20 text-sm font-medium animate-in zoom-in duration-300">
                                            {email}
                                            <button onClick={() => removeEmail(email)} className="hover:text-ink">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </form>

                            <div className="relative text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border"></span>
                                </div>
                                <span className="relative bg-paper px-4 text-xs font-bold text-muted uppercase tracking-widest">or</span>
                            </div>

                            {/* Import Options */}
                            <div className="grid grid-cols-2 gap-4">
                                <ImportButton
                                    icon={<Upload size={20} />}
                                    label="CSV / XLSX"
                                    desc="Upload list"
                                />
                                <ImportButton
                                    icon={<Sparkles size={20} className="text-ai" />}
                                    label="Google Contacts"
                                    desc="Sync directly"
                                />
                            </div>
                        </div>

                        {/* Summary Info */}
                        <div className="p-6 bg-paper-mid rounded-3xl border border-border flex items-center gap-4">
                            <div className="h-10 w-10 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <p className="text-sm text-muted">
                                You can set custom permissions for each member once they accept your invite.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-8">
                        <button
                            onClick={() => router.push("/onboarding/workspace")}
                            className="flex items-center gap-2 text-muted font-bold hover:text-ink transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Back
                        </button>

                        <button
                            disabled={isImporting}
                            onClick={handleFinish}
                            className="btn-primary px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-accent/20 active:scale-95 transition-all"
                        >
                            {isImporting ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Finalizing Setup...
                                </>
                            ) : (
                                <>
                                    Finish & Launch
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProgressStep({ number, title, active, completed }: { number: number, title: string, active?: boolean, completed?: boolean }) {
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

function ImportButton({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) {
    return (
        <button className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-border rounded-3xl hover:border-accent hover:shadow-lg transition-all text-center group">
            <div className="h-12 w-12 rounded-2xl bg-paper-mid flex items-center justify-center text-muted group-hover:bg-accent group-hover:text-white transition-all">
                {icon}
            </div>
            <div className="space-y-0.5">
                <h4 className="font-bold text-ink text-sm">{label}</h4>
                <p className="text-xs text-muted leading-tight">{desc}</p>
            </div>
        </button>
    );
}
