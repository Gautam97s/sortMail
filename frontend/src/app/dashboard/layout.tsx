"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // [BYPASS FOR DEV] router.push("/login");
            console.warn("Auth check failed but bypass is active on Layout");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-paper">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-paper-mid"></div>
                    <div className="text-muted text-sm font-medium">Loading Workspace...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // [BYPASS FOR DEV] return null; // Will redirect via useEffect
        console.warn("Proceeding despite not being authenticated");
    }

    return <>{children}</>;
}
