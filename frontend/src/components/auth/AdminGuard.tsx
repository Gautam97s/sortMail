"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace("/login");
            } else if (!user.is_superuser) {
                router.replace("/dashboard");
            }
        }
    }, [user, isLoading, router]);

    // Show nothing (or a loader) while checking auth status
    if (isLoading || !user || !user.is_superuser) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-base">
                <div className="flex flex-col items-center gap-4 text-ink-light">
                    <ShieldAlert className="h-8 w-8 animate-pulse text-warning" />
                    <p className="font-mono text-sm tracking-widest uppercase">Verifying Authorization</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
