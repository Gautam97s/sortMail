"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles, ChevronRight, ChevronLeft, Check, Shield, Zap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import gsap from "gsap";

import { mockOnboardingSteps, mockOnboardingTips } from "@/data/settings";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const steps = mockOnboardingSteps;
    const tips = mockOnboardingTips;
    const [preferences, setPreferences] = useState({
        aiTone: "normal",
        autoDraft: true,
        emailNotifications: true,
        pushNotifications: true,
    });

    useEffect(() => {
        gsap.fromTo(".step-content", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push("/dashboard");
        }
    };

    const handleSkip = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-[#C05E3C]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-[#7C5CFC]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-2xl w-full z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono tracking-widest uppercase mb-4">
                        <Zap size={10} fill="currentColor" /> Setup Progress
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-border/40 -translate-y-1/2 z-0" />
                    {steps.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center relative z-10 bg-paper px-4">
                                <div
                                    className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                                        ${isCompleted
                                            ? "bg-success text-white shadow-lg shadow-success/20"
                                            : isActive
                                                ? "bg-accent text-white shadow-lg shadow-accent/20 scale-110"
                                                : "bg-paper-mid border border-border text-muted"
                                        }
                                    `}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <DynamicIcon name={step.iconName} fallback={Mail} className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />}
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider mt-4 font-mono ${isActive ? "text-ink font-bold" : "text-muted"}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <Card className="step-content p-10 bg-white/80 backdrop-blur-md border-border/50 shadow-2xl shadow-ink/5 min-h-[460px] flex flex-col">
                    {currentStep === 1 && (
                        <div className="flex-1">
                            <h1 className="font-display text-3xl text-ink mb-3">
                                Connect Your Email
                            </h1>
                            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                SortMail needs read-only access to analyze your threads. We never store your passwords and only read what you allow.
                            </p>
                            <div className="grid gap-4">
                                <Button className="h-16 gap-4 justify-start px-6 bg-white hover:bg-paper-mid text-ink border border-border/60 hover:border-accent/40 shadow-sm" variant="outline">
                                    <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 flex items-center justify-center text-[#4285F4]">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" opacity="0.7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-semibold">Continue with Google</span>
                                        <span className="block text-[10px] text-muted font-mono uppercase tracking-tighter">Recommended for Gmail</span>
                                    </div>
                                </Button>
                                <Button className="h-16 gap-4 justify-start px-6 bg-white hover:bg-paper-mid text-ink border border-border/60 hover:border-accent/40 shadow-sm" variant="outline">
                                    <div className="w-8 h-8 rounded-lg bg-[#0078D4]/10 flex items-center justify-center text-[#0078D4]">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M24 7.387v10.478c0 .23-.08.424-.238.576a.806.806 0 01-.595.234h-8.167v-6.29l1.604 1.17a.327.327 0 00.428-.013l4.968-4.155v8.31h6.91l-2.986-11.004V6.69l-1.924-1.6V1.675z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-semibold">Continue with Outlook</span>
                                        <span className="block text-[10px] text-muted font-mono uppercase tracking-tighter">Office 365 & Outlook.com</span>
                                    </div>
                                </Button>
                            </div>
                            <div className="mt-8 flex items-center gap-2 p-3 rounded-lg bg-paper-mid border border-border/30">
                                <Shield size={14} className="text-success" />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Secure read-only OAuth connection</span>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="flex-1">
                            <h1 className="font-display text-3xl text-ink mb-3">
                                Personalize Your AI
                            </h1>
                            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                How should SortMail represent you? These settings can be changed anytime in your profile.
                            </p>
                            <div className="space-y-8">
                                <div>
                                    <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 block">
                                        AI Writing Style
                                    </Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["brief", "normal", "formal"].map((tone) => (
                                            <button
                                                key={tone}
                                                onClick={() => setPreferences({ ...preferences, aiTone: tone })}
                                                className={`
                                                    p-4 rounded-xl border transition-all capitalize text-sm font-medium
                                                    ${preferences.aiTone === tone
                                                        ? "border-accent bg-accent/5 text-accent shadow-sm"
                                                        : "border-border/60 hover:border-accent/30 text-ink-light"
                                                    }
                                                `}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-white shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center text-ai">
                                                <Zap size={16} />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-semibold text-ink block">Auto-Draft Replies</Label>
                                                <p className="text-[11px] text-muted-foreground">Drafts prepared for review</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={preferences.autoDraft}
                                            onCheckedChange={(checked) =>
                                                setPreferences({ ...preferences, autoDraft: checked })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-white shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                                                <Bell size={16} />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-semibold text-ink block">Smart Notifications</Label>
                                                <p className="text-[11px] text-muted-foreground">Only for urgent threads</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={preferences.pushNotifications}
                                            onCheckedChange={(checked) =>
                                                setPreferences({ ...preferences, pushNotifications: checked })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="flex-1">
                            <h1 className="font-display text-3xl text-ink mb-3">
                                Ready to Launch
                            </h1>
                            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                You&apos;re all set! Here&apos;s a quick breakdown of what happens next.
                            </p>
                            <div className="space-y-4">
                                {tips.map((tip, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-paper-mid border border-border/30">
                                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-ink">{tip.title}</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{tip.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10 pt-8 border-t border-border/60">
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="text-muted-foreground hover:text-ink text-xs font-medium"
                        >
                            Skip Setup
                        </Button>
                        <div className="flex gap-4">
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="gap-2 h-11 px-6 rounded-lg text-sm font-medium border-border/60"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            )}
                            <Button onClick={handleNext} className="gap-2 h-11 px-8 rounded-lg text-sm font-semibold shadow-lg shadow-accent/20">
                                {currentStep === steps.length ? "Enter Workspace" : "Continue"}
                                {currentStep < steps.length && <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>

                <p className="text-center text-[10px] text-muted-foreground mt-8 font-mono uppercase tracking-widest">
                    SortMail V0.1.0 &copy; 2024
                </p>
            </div>
        </div>
    );
}
