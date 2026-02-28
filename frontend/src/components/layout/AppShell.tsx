"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function AppShell({ children, title, subtitle }: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex w-full h-screen bg-paper overflow-hidden">
            {/* Mobile Overlay */}
            <div
                className={`drawer-overlay ${mobileSidebarOpen ? 'open' : ''}`}
                onClick={() => setMobileSidebarOpen(false)}
            />

            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                <Topbar
                    title={title}
                    subtitle={subtitle}
                    onMenuClick={() => setMobileSidebarOpen(true)}
                />

                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
