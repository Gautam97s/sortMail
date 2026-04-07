import React from "react";
import type { Priority, PriorityLevel } from "@/types/dashboard";

const PRIORITY_CLASSES: Record<Priority | PriorityLevel, string> = {
    URGENT: "priority-urgent",
    HIGH: "priority-high",
    MEDIUM: "priority-medium",
    LOW: "priority-low",
    DO_NOW: "priority-urgent",
    DO_TODAY: "priority-high",
    CAN_WAIT: "priority-low",
};

const PRIORITY_LABELS: Record<Priority | PriorityLevel, string> = {
    URGENT: "Urgent",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
    DO_NOW: "Do Now",
    DO_TODAY: "Do Today",
    CAN_WAIT: "Can Wait",
};

interface PriorityBadgeProps {
    priority: Priority | PriorityLevel;
    className?: string;
}

export default function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
    return (
        <span className={`priority-badge ${PRIORITY_CLASSES[priority]} ${className}`}>
            {PRIORITY_LABELS[priority]}
        </span>
    );
}
