"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import gsap from "gsap";
import Link from "next/link";

export default function CheckoutCancelPage() {
    const router = useRouter();

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(".cancel-icon", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
        tl.fromTo(".headline", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3");
        tl.fromTo(".subline", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4");
        tl.fromTo(".help-card", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.3");
    }, []);

    return (
        <main className="min-h-screen w-full bg-paper flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-danger/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md w-full z-10 text-center">
                <div className="cancel-icon w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-10 h-10 text-danger" />
                </div>

                <h1 className="headline font-display text-4xl text-ink leading-tight mb-4">
                    Upgrade Cancelled
                </h1>

                <p className="subline text-base text-ink-light leading-relaxed mb-10">
                    No changes were made to your account. You can continue using the free version of SortMail.
                </p>

                <Card className="help-card p-8 bg-white/80 backdrop-blur-sm border-border/50 shadow-xl shadow-ink/5 text-left mb-8">
                    <h3 className="text-sm font-semibold text-ink mb-6 flex items-center gap-2">
                        <HelpCircle size={16} className="text-accent" />
                        Need assistance?
                    </h3>

                    <div className="space-y-4">
                        <Link href="/support" className="flex items-center justify-between p-4 rounded-xl hover:bg-paper-mid transition-colors border border-border/30 group">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                                <span className="text-sm font-medium">Talk to Support</span>
                            </div>
                            <ArrowLeft size={14} className="rotate-180 text-muted-foreground" />
                        </Link>
                    </div>

                    <div className="mt-8 space-y-3">
                        <Button
                            onClick={() => router.push("/upgrade")}
                            className="w-full h-11"
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard")}
                            className="w-full h-11 gap-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>

                <p className="text-xs text-muted">
                    If you experienced an error during checkout, please let us know.
                </p>
            </div>
        </main>
    );
}
