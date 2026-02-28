import React from "react";
import Link from "next/link";
import {
    MessageCircle,
    Mail,
    Phone,
    BookOpen,
    Clock,
    ArrowRight
} from "lucide-react";
import { SupportHeader } from "@/components/support/SupportHeader";
import SupportForm from "@/components/support/SupportForm";

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-paper">
            <SupportHeader />

            <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left Side: Info & Categories */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight">
                                How can we <span className="italic text-accent">help you?</span>
                            </h1>
                            <p className="text-lg text-ink-light leading-relaxed max-w-2xl">
                                Whether you&apos;re experiencing a technical issue or have a question about your plan, our team is here to help you regain control of your inbox.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <SupportChannel
                                icon={<MessageCircle size={20} />}
                                title="Technical Support"
                                description="Issues with syncing, AI analysis, or dashboard errors."
                            />
                            <SupportChannel
                                icon={<Mail size={20} />}
                                title="Billing & Plans"
                                description="Inquiries about your subscription, invoices, or upgrades."
                            />
                            <SupportChannel
                                icon={<Clock size={20} />}
                                title="Response Time"
                                description="We typically respond within 12–24 hours on business days."
                                dark
                            />
                            <SupportChannel
                                icon={<BookOpen size={20} />}
                                title="Self-Service"
                                description="Check our documentation for instant answers to common questions."
                                link="/help"
                            />
                        </div>

                        <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">Enterprise Support</h3>
                                <p className="text-sm text-ink-light">Dedicated support for teams with over 50 users.</p>
                                <button className="text-accent text-sm font-bold mt-1 hover:underline">Call our sales team &rarr;</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <SupportForm />
                </div>
            </div>

            {/* Footer Links */}
            <div className="bg-paper-mid border-t border-border py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-sm text-ink-light font-medium">© 2026 SortMail Inc. Support Team</p>
                    <div className="flex gap-8">
                        <Link href="/status" className="text-sm text-muted hover:text-ink transition-colors font-medium">System Status</Link>
                        <Link href="/changelog" className="text-sm text-muted hover:text-ink transition-colors font-medium">Recent Updates</Link>
                        <Link href="/help" className="text-sm text-muted hover:text-ink transition-colors font-medium">Documentation</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SupportChannel({ icon, title, description, dark, link }: { icon: React.ReactNode, title: string, description: string, dark?: boolean, link?: string }) {
    const Component = link ? Link : 'div';
    const props = link ? { href: link } : {};

    return (
        <Component {...(props as any)} className={`p-6 rounded-2xl border ${dark ? 'bg-ink text-white border-white/10' : 'bg-white border-border/50 shadow-sm'} space-y-3 transition-all ${link ? 'hover:border-accent hover:shadow-md cursor-pointer group' : ''}`}>
            <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${dark ? 'bg-white/10' : 'bg-paper-mid text-accent'}`}>
                {icon}
            </div>
            <h3 className="font-bold">{title}</h3>
            <p className={`text-sm leading-relaxed ${dark ? 'text-ink-light' : 'text-muted'}`}>{description}</p>
            {link && (
                <div className="pt-2 flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                    Learn more <ArrowRight size={14} />
                </div>
            )}
        </Component>
    );
}
