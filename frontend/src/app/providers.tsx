"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

const queryClient = new QueryClient();

function GlobalRealtimeListener() {
    useRealtimeEvents();
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <GlobalRealtimeListener />
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
}
