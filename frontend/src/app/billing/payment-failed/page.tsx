"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import gsap from "gsap";

export default function PaymentFailedPage() {
    const router = useRouter();

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(".error-icon", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
        tl.fromTo(".headline", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3");
        tl.fromTo(".info-card", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4");
    }, []);

    return (
        <main className="min-h-screen w-full bg-paper flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-danger/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-warning/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-md w-full z-10 text-center">
                <div className="error-icon w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="w-10 h-10 text-danger" />
                </div>

                <h1 className="headline font-display text-4xl text-ink leading-tight mb-4 tracking-tight">
                    Payment Failed
                </h1>

                <p className="text-base text-ink-light leading-relaxed mb-10">
                    We couldn&apos;t process your transaction. Please check your payment details and try again.
                </p>

                <Card className="info-card p-8 bg-white/80 backdrop-blur-md border-danger/20 shadow-2xl shadow-danger/5 text-left mb-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-danger/50" />

                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-danger/5 flex items-center justify-center text-danger shrink-0 mt-1">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-ink">Possible Reasons</h4>
                            <ul className="mt-3 space-y-2">
                                {["Insufficient funds", "Expired card", "Incorrect billing address", "Bank authorization required"].map((reason, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-danger/40" />
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full h-11 gap-2 bg-danger hover:bg-danger/90 text-white shadow-lg shadow-danger/20"
                            onClick={() => router.push("/upgrade")}
                        >
                            <RefreshCw size={16} />
                            Try Different Card
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-11 gap-2 border-border/60"
                            onClick={() => router.push("/dashboard")}
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>

                <p className="text-xs text-muted leading-relaxed">
                    Need help? <Link href="/support" className="text-accent underline hover:text-accent-dark">Contact our billing team</Link> or try again later.
                </p>
            </div>
        </main>
    );
}

// Helper Link component if not already imported from next/link
import Link from "next/link";
