"use client";

import React from "react";
import Link from "next/link";
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Activity,
    ShieldCheck,
    Zap,
    Database,
    LayoutDashboard,
    Globe,
    ChevronRight,
    ArrowLeft
} from "lucide-react";

export default function StatusPage() {
    const services = [
        { name: "API Service", status: "operational", icon: <Globe size={20} /> },
        { name: "Dashboard UI", status: "operational", icon: <LayoutDashboard size={20} /> },
        { name: "AI Intelligence Engine", status: "operational", icon: <Zap size={20} /> },
        { name: "Database Cluster", status: "operational", icon: <Database size={20} /> },
        { name: "Email Sync Worker", status: "operational", icon: <Activity size={20} /> },
        { name: "Auth & Security Service", status: "operational", icon: <ShieldCheck size={20} /> },
    ];

    const incidents = [
        {
            date: "Feb 26, 2026",
            title: "Partial service disruption: AI Summary Generation",
            status: "resolved",
            duration: "45 mins",
            description: "We experienced connectivity issues with our primary AI model provider. Fallback mechanisms were active, but some users saw delays in summary generation."
        },
        {
            date: "Feb 14, 2026",
            title: "Scheduled Maintenance: Database Upgrades",
            status: "resolved",
            duration: "2 hours",
            description: "Successful migration to a high-availability database cluster. No downtime was experienced by end-users."
        },
        {
            date: "Jan 30, 2026",
            title: "Intermittent Sync Delays",
            status: "resolved",
            duration: "1 hour",
            description: "High traffic caused a backlog in our email processing queue. Additional worker nodes were provisioned to clear the queue."
        }
    ];

    return (
        <div className="min-h-screen bg-paper font-body selection:bg-accent/30">
            {/* Header */}
            <div className="bg-white/70 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                                <Activity size={18} className="text-white" />
                            </div>
                        </Link>
                        <h1 className="font-display font-bold text-ink">System Status</h1>
                    </div>
                    <Link href="/" className="text-sm font-medium text-muted hover:text-ink flex items-center gap-1 transition-colors">
                        <ArrowLeft size={14} /> Back to App
                    </Link>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20 space-y-12">

                {/* Global Status Banner */}
                <div className="bg-success/5 border border-success/20 rounded-[2.5rem] p-8 md:p-12 text-center space-y-4">
                    <div className="h-20 w-20 bg-success text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-success/20 animate-pulse">
                        <CheckCircle2 size={44} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-ink tracking-tight">
                            All Systems <span className="text-success">Operational</span>
                        </h2>
                        <p className="text-ink-light font-medium">As of February 28, 2026 at 10:29 AM UTC</p>
                    </div>
                </div>

                {/* Services Grid */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="section-label">Service Health</h3>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success"></span> Operational</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning"></span> Degraded</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger"></span> Outage</span>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((service) => (
                            <div key={service.name} className="card p-5 flex items-center justify-between hover:border-border-deep transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-paper-mid text-muted flex items-center justify-center group-hover:text-accent transition-colors">
                                        {service.icon}
                                    </div>
                                    <span className="font-medium text-ink text-sm">{service.name}</span>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Uptime History (Mock Visual) */}
                <section className="space-y-6">
                    <h3 className="section-label text-center">Uptime (Last 90 Days)</h3>
                    <div className="card p-6 overflow-hidden">
                        <div className="flex gap-1 h-12">
                            {Array.from({ length: 90 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full ${i === 24 || i === 58 ? 'bg-warning/40' : 'bg-success/50'} hover:bg-opacity-100 transition-all cursor-crosshair`}
                                    title={`Day ${90 - i}: 100% uptime`}
                                ></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] uppercase tracking-widest font-bold text-muted px-1">
                            <span>90 days ago</span>
                            <span className="text-success font-mono">99.98% Average Uptime</span>
                            <span>Today</span>
                        </div>
                    </div>
                </section>

                {/* Past Incidents */}
                <section className="space-y-8">
                    <h3 className="section-label">Past Incidents</h3>
                    <div className="space-y-6">
                        {incidents.map((incident, i) => (
                            <div key={i} className="relative pl-12 before:absolute before:left-[19px] before:top-8 before:bottom-0 before:w-px before:bg-border last:before:hidden">
                                <div className="absolute left-0 top-0 h-10 w-10 rounded-full bg-white border border-border flex items-center justify-center text-muted shrink-0 z-10 transition-colors hover:border-accent">
                                    <Clock size={16} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">{incident.date}</span>
                                        <span className="h-1 w-1 rounded-full bg-border"></span>
                                        <span className="text-xs font-bold text-success capitalize">{incident.status}</span>
                                    </div>
                                    <h4 className="text-lg font-display font-bold text-ink leading-tight">{incident.title}</h4>
                                    <p className="text-sm text-ink-light leading-relaxed max-w-2xl">
                                        {incident.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted pt-1">
                                        <AlertCircle size={12} />
                                        Duration: {incident.duration}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Subscribe Card */}
                <div className="bg-ink rounded-[2.5rem] p-10 md:p-14 text-center space-y-6 text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10 space-y-2">
                        <h3 className="text-2xl md:text-3xl font-display font-bold">Get status updates</h3>
                        <p className="text-ink-light max-w-md mx-auto">
                            Sign up to receive incident notifications directly via email or SMS.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8">
                        <input
                            type="email"
                            placeholder="you@email.com"
                            className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-muted outline-none focus:ring-2 focus:ring-accent transition-all"
                        />
                        <button className="btn-primary bg-white text-ink hover:bg-paper px-8 py-4 font-bold border-none transition-transform active:scale-95 shadow-xl shadow-ink/20">
                            Subscribe
                        </button>
                    </div>
                </div>

            </main>

            <footer className="border-t border-border py-12 text-center text-xs text-muted tracking-widest font-bold uppercase">
                Powered by SortMail Ops Monitoring
            </footer>
        </div>
    );
}
