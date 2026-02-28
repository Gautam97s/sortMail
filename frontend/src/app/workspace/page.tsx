"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users,
    UserPlus,
    Settings,
    Shield,
    Zap,
    BarChart3,
    MoreVertical,
    Mail,
    Globe,
    Lock
} from "lucide-react";
import { mockTeamMembers } from "@/data/settings";

export default function WorkspacePage() {
    return (
        <AppShell title="Workspace" subtitle="Team Management">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

                {/* Workspace Header Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<Users className="text-accent" />}
                        label="Active Members"
                        value={mockTeamMembers.filter(m => m.status === 'Active').length.toString()}
                        suffix="/ 50"
                    />
                    <StatCard
                        icon={<Zap className="text-ai" />}
                        label="AI Intelligence Level"
                        value="Pro"
                        badge="Tier 2"
                    />
                    <StatCard
                        icon={<Lock className="text-success" />}
                        label="Security Status"
                        value="SOC2"
                        badge="Compliant"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Main Section: Team Members */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users size={20} className="text-ink" />
                                    <h2 className="text-xl font-display font-bold text-ink">Team Members</h2>
                                </div>
                                <Button className="gap-2">
                                    <UserPlus size={16} />
                                    Invite Member
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {mockTeamMembers.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-6 hover:bg-paper-mid transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border border-border-light shadow-sm">
                                                        {member.picture && <AvatarImage src={member.picture} />}
                                                        <AvatarFallback className="bg-paper text-ink font-bold">
                                                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-ink">{member.name}</h3>
                                                        <p className="text-sm text-ink-light">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden sm:block">
                                                        <Badge variant={member.role === 'Owner' ? 'default' : 'secondary'} className="mb-1 uppercase tracking-widest text-[10px]">
                                                            {member.role}
                                                        </Badge>
                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${member.status === 'Active' ? 'text-success' : 'text-warning'}`}>
                                                            {member.status}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-muted hover:text-ink">
                                                        <MoreVertical size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Recent Workspace Activity */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ActivityIcon size={20} className="text-ink" />
                                <h2 className="text-xl font-display font-bold text-ink">Recent Team Activity</h2>
                            </div>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <ActivityItem
                                            user="Sarah Chen"
                                            action="shared a thread"
                                            target="Client A Contract Review"
                                            time="2 hours ago"
                                        />
                                        <ActivityItem
                                            user="Alex Riv"
                                            action="completed a task"
                                            target="Schedule Team Standup"
                                            time="4 hours ago"
                                        />
                                        <ActivityItem
                                            user="Gautam"
                                            action="invited new member"
                                            target="David S."
                                            time="6 hours ago"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar Section: Settings & Info */}
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <h3 className="section-label">Workspace Info</h3>
                            <Card className="bg-ink text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Globe size={100} />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg">BuildVerse Workspace</CardTitle>
                                    <CardDescription className="text-ink-light">sortmail.ai/buildverse</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-ink-light">Created</span>
                                        <span className="font-bold">Jan 20, 2026</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-ink-light">Plan</span>
                                        <Badge variant="outline" className="text-accent border-accent">Enterprise</Badge>
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <Button variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/5 text-white gap-2">
                                        <Settings size={14} />
                                        Workspace Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-4">
                            <h3 className="section-label">Global Controls</h3>
                            <div className="space-y-3">
                                <ControlButton
                                    icon={<Shield size={16} />}
                                    label="Security Policy"
                                    desc="Manage team password rules"
                                />
                                <ControlButton
                                    icon={<Mail size={16} />}
                                    label="Domain Access"
                                    desc="Restrict to @company.com"
                                />
                                <ControlButton
                                    icon={<BarChart3 size={16} />}
                                    label="Usage Reports"
                                    desc="AI token usage analytics"
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

function StatCard({ icon, label, value, suffix, badge }: { icon: React.ReactNode, label: string, value: string, suffix?: string, badge?: string }) {
    return (
        <Card className="hover:border-border-deep transition-all">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-paper-mid flex items-center justify-center">
                        {icon}
                    </div>
                    <span className="section-label">{label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold text-ink">{value}</span>
                    {suffix && <span className="text-sm font-mono text-muted">{suffix}</span>}
                    {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityItem({ user, action, target, time }: { user: string, action: string, target: string, time: string }) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
            <div className="flex-1">
                <p className="text-ink">
                    <span className="font-bold">{user}</span> {action} <span className="font-bold text-accent">&quot;{target}&quot;</span>
                </p>
                <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">{time}</p>
            </div>
        </div>
    );
}

function ControlButton({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) {
    return (
        <button className="w-full flex items-start gap-4 p-4 rounded-2xl border border-border bg-white hover:border-accent hover:shadow-lg hover:shadow-ink/5 transition-all group text-left">
            <div className="h-10 w-10 rounded-xl bg-paper-mid text-muted flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-ink text-sm group-hover:text-accent transition-colors">{label}</h4>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
            </div>
        </button>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
