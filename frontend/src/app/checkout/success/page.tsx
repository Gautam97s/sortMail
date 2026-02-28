"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import gsap from "gsap";

export default function CheckoutSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(".success-icon", { scale: 0, rotate: -45 }, { scale: 1, rotate: 0, duration: 0.8, ease: "back.out(1.7)" });
        tl.fromTo(".headline", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3");
        tl.fromTo(".subline", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4");
        tl.fromTo(".benefit-item", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, "-=0.3");
        tl.fromTo(".action-btn", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");
    }, []);

    return (
        <main className="min-h-screen w-full bg-paper flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-success/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md w-full z-10 text-center">
                <div className="success-icon w-24 h-24 rounded-3xl bg-success/10 flex items-center justify-center mx-auto mb-10 relative">
                    <CheckCircle2 className="w-12 h-12 text-success" />
                    <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-success/30" />
                </div>

                <h1 className="headline font-display text-4xl text-ink leading-tight mb-4">
                    Welcome to Pro
                </h1>

                <p className="subline text-base text-ink-light leading-relaxed mb-12">
                    Your account has been upgraded. You now have full access to our premium AI intelligence layer.
                </p>

                <Card className="p-8 bg-white/80 backdrop-blur-md border-border/50 shadow-2xl shadow-ink/5 mb-10 text-left">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">Unlocked Features</h3>

                    <div className="space-y-6">
                        {[
                            { title: "Unlimited AI Drafts", desc: "No more monthly quota on replies.", icon: Zap },
                            { title: "Priority Syncing", desc: "Your inbox updates in near real-time.", icon: ArrowRight },
                            { title: "Advanced Analytics", desc: "Deep insights into your communication patterns.", icon: Sparkles },
                        ].map((item, i) => (
                            <div key={i} className="benefit-item flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                    <item.icon size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="action-btn">
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="w-full h-14 gap-3 text-base font-semibold shadow-xl shadow-accent/20"
                    >
                        Go to Dashboard
                        <ArrowRight size={18} />
                    </Button>
                    <p className="mt-6 text-xs text-muted">
                        A receipt has been sent to your email.
                    </p>
                </div>
            </div>
        </main>
    );
}
