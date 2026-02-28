import React from "react";

interface AvatarProps {
    initials: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZE_MAP = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
};

// Deterministic color from initials
const AVATAR_COLORS = [
    "bg-[#E8D5C4] text-[#6B4226]",
    "bg-[#D4E8D5] text-[#2D6B3A]",
    "bg-[#D5D4E8] text-[#3A2D6B]",
    "bg-[#E8D4D4] text-[#6B2D2D]",
    "bg-[#D4E0E8] text-[#2D4F6B]",
    "bg-[#E8E4D4] text-[#6B5A2D]",
];

function getColorIndex(initials: string): number {
    const code = initials.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return code % AVATAR_COLORS.length;
}

export default function Avatar({ initials, size = "md", className = "" }: AvatarProps) {
    const color = AVATAR_COLORS[getColorIndex(initials)];

    return (
        <div
            className={`${SIZE_MAP[size]} ${color} rounded-full flex items-center justify-center font-semibold font-mono shrink-0 ${className}`}
        >
            {initials}
        </div>
    );
}
