"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, AlertTriangle, Info } from "lucide-react";

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    loading?: boolean;
}

export default function ConfirmActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
}: ConfirmActionModalProps) {
    const icons = {
        danger: { icon: Trash2, color: "text-danger", bg: "bg-danger/10", border: "border-danger/20", btn: "bg-danger hover:bg-danger/90 shadow-danger/20" },
        warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", btn: "bg-warning hover:bg-warning/90 shadow-warning/20" },
        info: { icon: Info, color: "text-info", bg: "bg-info/10", border: "border-info/20", btn: "bg-info hover:bg-info/90 shadow-info/20" },
    };

    const cfg = icons[variant];
    const Icon = cfg.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                <div className="p-8 pb-4 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl ${cfg.bg} flex items-center justify-center mb-6 border ${cfg.border}`}>
                        <Icon className={`w-8 h-8 ${cfg.color}`} />
                    </div>

                    <DialogHeader className="p-0 text-center sm:text-center">
                        <DialogTitle className="font-display text-2xl text-ink mb-2">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <DialogFooter className="px-8 py-6 bg-paper-mid/40 border-t border-border/10 mt-4 flex sm:flex-row flex-col gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-11 text-muted-foreground hover:text-ink font-medium"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 h-11 font-semibold text-white shadow-lg ${cfg.btn}`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
