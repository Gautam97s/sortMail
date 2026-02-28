"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import gsap from "gsap";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setError("No verification token found.");
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/magic-link/verify?token=${token}`, {
                    credentials: "include"
                });
                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        router.push(data.redirect || "/dashboard");
                    }, 2000);
                } else {
                    setStatus("error");
                    setError(data.detail || "Verification failed");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus("error");
                setError("A connection error occurred.");
            }
        };

        verifyToken();
    }, [searchParams, router]);

    useEffect(() => {
        if (status === "success") {
            gsap.fromTo(".success-icon", { scale: 0, rotate: -180 }, { scale: 1, rotate: 0, duration: 0.8, ease: "back.out(1.7)" });
        }
    }, [status]);

    return (
        <main className="min-h-screen w-full bg-paper flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-[#C05E3C]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-[#7C5CFC]/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="max-w-md w-full p-10 text-center z-10 bg-white/80 backdrop-blur-md shadow-2xl border-none">
                {status === "verifying" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        </div>
                        <h1 className="font-display text-3xl text-ink leading-tight">
                            Verifying your link...
                        </h1>
                        <p className="text-muted leading-relaxed">
                            Just a second, we&apos;re signing you into your account.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6">
                        <div className="success-icon w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-success" />
                        </div>
                        <h1 className="font-display text-3xl text-ink leading-tight">
                            Successfully signed in!
                        </h1>
                        <p className="text-muted leading-relaxed">
                            Redirecting you to your dashboard...
                        </p>
                        <div className="flex justify-center gap-1">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-danger" />
                        </div>
                        <h1 className="font-display text-3xl text-ink leading-tight">
                            Auth Failed
                        </h1>
                        <p className="text-danger font-medium">{error}</p>
                        <p className="text-sm text-muted">
                            The link may have expired or already been used. Please try requesting a new magic link.
                        </p>
                        <button
                            onClick={() => router.push("/login")}
                            className="btn-primary w-full h-12 mt-4"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </Card>
        </main>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-paper flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </main>
        }>
            <VerifyContent />
        </Suspense>
    );
}
