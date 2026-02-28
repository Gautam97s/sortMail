'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell title="Admin Control Center">
            <div className="flex flex-col h-full overflow-hidden relative">
                {/* Admin Mode Indicator */}
                <div className="bg-warning/10 border-b border-warning/20 px-8 py-1.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-warning uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        Administrative Privileges Active
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </AppShell>
    );
}
