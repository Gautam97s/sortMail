"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavigationBar from "./TopNavigationBar";
import RightSidebar from "./RightSidebar";

interface AppShellProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex w-full h-screen overflow-hidden relative bg-gradient-to-br from-[#f8f7ff] via-[#f0f3ff] to-[#f5f0ff]">
            {/* Background Decorative Mesh Gradient / Blobs for Glassmorphism */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-accent2/20 blur-[130px] pointer-events-none" />
            <div className="absolute top-[20%] right-[20%] w-[35%] h-[35%] rounded-full bg-ai-purple/15 blur-[100px] pointer-events-none" />

            {/* Mobile Overlay */}
            <div
                className={`drawer-overlay ${mobileSidebarOpen ? 'open' : ''} z-40`}
                onClick={() => setMobileSidebarOpen(false)}
            />

            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full min-w-0">
                <TopNavigationBar
                    onMobileSidebarOpen={() => setMobileSidebarOpen(true)}
                    searchPlaceholder={title || "Search emails, subjects or summaries..."}
                />

                <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-full">
                    <div className="w-full max-w-full">
                        {children}
                    </div>
                </div>
            </main>

            {/* Right Contextual Sidebar */}
            <RightSidebar />
        </div>
    );
}
