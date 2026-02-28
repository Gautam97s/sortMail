"use client";

import React from "react";
import {
    Eye,
    Lock,
    FileText,
    Scale,
    FileCheck,
    AlertCircle,
    Shield,
    Github,
    Mail,
    Sparkles,
    BookOpen,
    Compass,
    CreditCard,
    Zap,
    Bell,
    type LucideProps
} from "lucide-react";

export const ICON_MAP = {
    Eye,
    Lock,
    FileText,
    Scale,
    FileCheck,
    AlertCircle,
    Shield,
    Github,
    Mail,
    Sparkles,
    BookOpen,
    Compass,
    CreditCard,
    Zap,
    Bell
} as const;

export type IconName = keyof typeof ICON_MAP;

interface DynamicIconProps extends LucideProps {
    name: string;
    fallback?: React.ComponentType<LucideProps>;
}

export function DynamicIcon({ name, fallback: Fallback, ...props }: DynamicIconProps) {
    const Icon = (ICON_MAP as any)[name];

    if (!Icon) {
        if (Fallback) return <Fallback {...props} />;
        return null;
    }

    return <Icon {...props} />;
}
