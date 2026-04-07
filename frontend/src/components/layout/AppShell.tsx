"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavigationBar from "./TopNavigationBar";
import RightSidebar from "./RightSidebar";

interface AppShellProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    showRightSidebar?: boolean;
    onSearchChange?: (value: string) => void;
}

export default function AppShell({ 
    children, 
    title, 
    subtitle, 
    showRightSidebar = true,
    onSearchChange
}: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-background text-on-surface select-none font-body">
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
                />

                <div className="flex-1 overflow-auto w-full transition-all duration-300 custom-scrollbar">
                    <div className="w-full max-w-full min-h-full">
                        {children}
                    </div>
                </div>
            </main>

            {/* Right Contextual Sidebar - AI Intelligence Pane */}
            {showRightSidebar && (
                <div className="hidden lg:block w-80 shrink-0 h-full border-l border-outline-variant/15 bg-surface-container-low transition-all duration-300">
                    <RightSidebar />
                </div>
            )}
        </div>
    );
}
