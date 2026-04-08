"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavigationBar from "./TopNavigationBar";

interface AppShellProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    onSearchChange?: (value: string) => void;
}

export default function AppShell({ 
    children, 
    title, 
    subtitle, 
    onSearchChange
}: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-background text-on-surface font-body">
            {/* Mobile Overlay */}
            <div
                className={`drawer-overlay ${mobileSidebarOpen ? 'open' : ''} z-40 transition-all duration-300`}
                onClick={() => setMobileSidebarOpen(false)}
            />

            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative z-10 w-full min-w-0 bg-surface-container-lowest">
                <TopNavigationBar
                    onMobileSidebarOpen={() => setMobileSidebarOpen(true)}
                    onSearchChange={onSearchChange}
                    searchPlaceholder={title || "Search your intelligent workspace..."}
                    title={title}
                    subtitle={subtitle}
                />

                <div className="flex-1 overflow-auto w-full transition-all duration-300 custom-scrollbar">
                    <div className="w-full max-w-full min-h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
