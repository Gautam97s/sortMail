"use client";

import { mockAppStatus, mockUserProfile } from "@/data/user";

export function Header() {
    const status = mockAppStatus;
    const user = mockUserProfile;
    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <button className="btn-primary">
                    Sync Emails
                </button>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Last sync: {status.lastSync}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{user.initials}</span>
                </div>
            </div>
        </header>
    );
}
