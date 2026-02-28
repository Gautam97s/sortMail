import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-paper-mid flex items-center justify-center mb-4">
                {icon || <Inbox size={24} className="text-muted" />}
            </div>
            <h3 className="text-lg font-display text-ink mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted max-w-xs">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
