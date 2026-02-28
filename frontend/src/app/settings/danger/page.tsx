"use client";

import React, { useState } from "react";
import {
    AlertTriangle,
    RefreshCcw,
    Trash2,
    LogOut,
    ShieldAlert,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DangerZonePage() {
    const router = useRouter();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetData = async () => {
        setLoading(true);
        try {
            await api.post("/api/auth/users/me/reset");
            setIsResetModalOpen(false);
            // After reset, go back to dashboard to refresh state
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to reset data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await api.delete("/api/auth/users/me");
            setIsDeleteModalOpen(false);
            router.push("/login?message=AccountDeleted");
        } catch (error) {
            console.error("Failed to delete account:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <header>
                <h2 className="text-2xl font-display text-ink flex items-center gap-2">
                    <AlertTriangle className="text-danger" size={24} />
                    Danger Zone
                </h2>
                <p className="text-muted text-sm mt-1">
                    Manage your data and account status. These actions are destructive and cannot be undone.
                </p>
            </header>

            {/* ─── Disconnect Section ─────────────────── */}
            <Card className="border-border-light overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <LogOut size={18} className="text-muted" />
                        Connected Accounts
                    </CardTitle>
                    <CardDescription>
                        Revoke access to your Gmail or Outlook accounts. This halts all AI processing immediately.
                    </CardDescription>
                </CardHeader>
                <CardContent className="bg-paper-mid/20 p-4 border-t border-border-light">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-border-light flex items-center justify-center">
                                <span className="font-bold text-lg text-ink">G</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-ink">Google Workspace</p>
                                <p className="text-xs text-muted">Primary sync active</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push("/settings/accounts")}>
                            Manage Accounts <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Reset Section ──────────────────────── */}
            <Card className="border-border-light overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <RefreshCcw size={18} className="text-warning" />
                        Reset Intelligence Data
                    </CardTitle>
                    <CardDescription>
                        Clear all summaries, tasks, and drafts. Your account status and subscription remain unchanged.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="bg-warning/5 p-4 border-t border-warning/10 flex justify-between items-center">
                    <p className="text-xs text-warning-deep font-medium italic">
                        All AI-generated insights will be permanently wiped.
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white border-warning/30 hover:border-warning/60 text-warning-deep"
                        onClick={() => setIsResetModalOpen(true)}
                    >
                        Reset All Data
                    </Button>
                </CardFooter>
            </Card>

            {/* ─── Delete Section ─────────────────────── */}
            <Card className="border-danger/20 border bg-danger/5 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-primary">
                        <Trash2 size={18} />
                        Delete Account Permanently
                    </CardTitle>
                    <CardDescription className="text-primary/70">
                        Permanently remove your account, data, and subscription. This action is terminal.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="bg-danger/10 p-4 border-t border-danger/20 flex justify-between items-center">
                    <p className="text-xs text-danger-deep font-medium">
                        SortMail will never be able to recover this profile.
                    </p>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete My Account
                    </Button>
                </CardFooter>
            </Card>

            {/* ─── Confirmation Modals ─────────────────── */}

            {/* Reset Modal */}
            <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCcw size={18} className="text-warning" />
                            Confirm Data Reset
                        </DialogTitle>
                        <DialogDescription>
                            This will delete all analyzed threads, tasks, and drafts from our database. Are you sure?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="secondary"
                            className="bg-warning text-white hover:bg-warning-deep"
                            onClick={handleResetData}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Yes, Reset Everything
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md border-danger/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-danger">
                            <ShieldAlert size={18} />
                            Final Warning
                        </DialogTitle>
                        <DialogDescription>
                            This will permanently delete your account and all associated data. You will be logged out immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-danger/10 p-3 rounded-lg border border-danger/20 my-2">
                        <p className="text-xs text-danger-deep font-mono">
                            Action cannot be reversed.
                        </p>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>I changed my mind</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Delete My Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
