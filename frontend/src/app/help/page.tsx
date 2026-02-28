"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Search,
    BookOpen,
    Shield,
    Zap,
    CreditCard,
    ArrowRight,
    MessageCircle,
    LifeBuoy,
    Compass,
    Sparkles,
    type LucideIcon
} from "lucide-react";
import { mockHelpCategories } from "@/data/help";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

// Removed manual ICON_MAP in favor of DynamicIcon

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-paper">
            {/* Hero / Search Section */}
            <div className="bg-ink py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold tracking-wider uppercase">
                            <LifeBuoy size={14} />
                            Support Center
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl text-white font-bold tracking-tight">
                            How can we help?
                        </h1>
                        <p className="text-ink-light text-lg">
                            Search our documentation or browse categories below to find answers.
                        </p>
                    </div>

                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Search for articles, features, or troubleshooting..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-lg backdrop-blur-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {mockHelpCategories.map((category) => {
                        const colorClass = category.iconName === 'Compass' ? 'text-accent bg-accent/10' :
                            category.iconName === 'Sparkles' ? 'text-ai bg-ai/10' :
                                category.iconName === 'Shield' ? 'text-success bg-success/10' :
                                    'text-warning bg-warning/10';

                        return (
                            <div key={category.title} className="card p-8 group hover:border-accent/30 transition-all">
                                <div className="flex items-start gap-6">
                                    <div className={`h-14 w-14 ${colorClass} rounded-2xl flex items-center justify-center shrink-0`}>
                                        <DynamicIcon name={category.iconName} fallback={BookOpen} size={28} />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <h2 className="text-2xl font-display font-bold text-ink mb-2">
                                                {category.title}
                                            </h2>
                                            <p className="text-ink-light leading-relaxed">
                                                {category.description}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            {category.articles.map((article) => (
                                                <Link
                                                    key={article.slug}
                                                    href={`/help/${article.slug}`}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-paper-mid text-ink-light hover:text-ink transition-all group/link"
                                                >
                                                    <span className="text-sm font-medium">{article.title}</span>
                                                    <ArrowRight size={14} className="opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all text-accent" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ / Direct Contact */}
                <div className="mt-20 p-10 bg-paper-mid rounded-3xl border border-border flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-display font-bold text-ink">
                            Still have questions?
                        </h3>
                        <p className="text-ink-light">
                            Our team is here to help you get the most out of SortMail.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="btn-secondary px-8 py-3">
                            <BookOpen size={18} />
                            Read Docs
                        </button>
                        <button className="btn-primary px-8 py-3 bg-ink hover:bg-ink/90 border-ink/10">
                            <MessageCircle size={18} />
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-border mt-20 text-center">
                <p className="text-sm text-muted">
                    © 2026 SortMail Help Center · <Link href="/" className="hover:text-accent underline underline-offset-4">Return to Product</Link>
                </p>
            </footer>
        </div>
    );
}
