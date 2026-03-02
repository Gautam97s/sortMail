"use client";

import { useUser } from "@/hooks/useUser";

export function Header() {
    const status = { state: "online", lastSync: "Just now" };
    // user is fetched via useUser already on line 9
    const { data: userData } = useUser();
    const user = userData || { name: "Guest", email: "", initials: "G", role: "User", picture: "" };
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
                    <span className="text-sm font-medium text-primary">{user.name?.charAt(0) || "G"}</span>
                </div>
            </div>
        </header>
    );
}
