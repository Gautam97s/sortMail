"use client";

import React from "react";
import { Mail, AlertTriangle, CheckSquare, Clock } from "lucide-react";
import type { QuickStats } from "@/types/dashboard";

const STAT_CONFIG = [
    { key: "unread" as const, label: "Unread", icon: Mail, color: "text-info" },
    { key: "urgent" as const, label: "Urgent", icon: AlertTriangle, color: "text-danger" },
    { key: "tasksDue" as const, label: "Tasks Due", icon: CheckSquare, color: "text-warning" },
    { key: "awaitingReply" as const, label: "Awaiting Reply", icon: Clock, color: "text-ai" },
];

interface StatCardsProps {
    stats: QuickStats;
}

export default function StatCards({ stats }: StatCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="stat-card group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <Icon size={18} className={`${color} opacity-70`} />
                    </div>
                    <div className="stat-card-value">{stats[key]}</div>
                    <div className="stat-card-label">{label}</div>
                    {key === "unread" && stats.unreadDelta && (
                        <div className="stat-card-delta up">{stats.unreadDelta}</div>
                    )}
                </div>
            ))}
        </div>
    );
}
