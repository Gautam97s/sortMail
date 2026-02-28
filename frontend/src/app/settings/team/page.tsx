"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, MoreVertical, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { mockTeamMembers } from "@/data/settings";

export default function TeamSettingsPage() {
    const [members] = useState(mockTeamMembers);

    return (
        <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-3xl text-ink font-bold">Team Settings</h1>
                    <p className="text-ink-light mt-2">Manage your team members and their access levels.</p>
                </div>
                <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                        {members.length} members in your organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-border-light">
                        {members.map((member) => (
                            <div key={member.id} className="py-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border border-border-light">
                                        <AvatarFallback className="bg-primary/5 text-primary text-sm font-display">
                                            {member.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-ink">{member.name}</span>
                                            {member.status === "Pending" && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider">Pending</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-ink-light">
                                            <Mail className="w-3 h-3" />
                                            {member.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-ink">{member.role}</div>
                                        <div className="text-xs text-ink-light">Role</div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-ink-light opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                                            <DropdownMenuItem className="text-danger">Remove Member</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Shield className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-ink">Role Permissions</h4>
                        <p className="text-sm text-ink-light mt-1">
                            Administrators can manage team members, billings, and integrations.
                            Members can access shared inbox rules and intelligence features.
                        </p>
                        <Button variant="link" className="text-primary p-0 h-auto mt-2 text-sm">
                            Learn more about roles & permissions
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
