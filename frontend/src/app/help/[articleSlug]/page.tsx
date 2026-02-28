"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    Share2,
    Clock,
    ChevronRight,
    Search,
    LifeBuoy
} from "lucide-react";
import { mockHelpArticles } from "@/data/help";
import { notFound } from "next/navigation";

export default function HelpArticlePage() {
    const params = useParams();
    const slug = params.articleSlug as string;

    const article = mockHelpArticles[slug];

    if (!article) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-paper pb-20">
            {/* Simple Top Nav */}
            <nav className="border-b border-border bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <Link href="/help" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                            <LifeBuoy size={16} />
                        </div>
                        <span className="font-display font-bold text-ink">Help Center</span>
                    </Link>
                    <div className="relative flex-1 max-w-md hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-full pl-9 pr-4 py-2 bg-paper-mid border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent transition-all"
                        />
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <main className="flex-1 max-w-3xl">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm text-ink-light mb-8">
                            <Link href="/help" className="hover:text-accent transition-colors">Help Home</Link>
                            <ChevronRight size={14} />
                            <span className="text-ink font-medium">{article.categoryTitle}</span>
                        </div>

                        <div className="space-y-6 mb-10 pb-10 border-b border-border">
                            <h1 className="font-display text-4xl md:text-5xl text-ink font-bold tracking-tight">
                                {article.title}
                            </h1>
                            <div className="flex items-center gap-6 text-sm text-ink-light">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    {article.readTime}
                                </div>
                                <div>Updated {article.lastUpdated}</div>
                            </div>
                        </div>

                        {/* Prose Content */}
                        <div
                            className="prose prose-ink max-w-none text-ink-light leading-relaxed article-content"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Feedback Section */}
                        <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-1 text-center sm:text-left">
                                <p className="font-medium text-ink">Was this article helpful?</p>
                                <p className="text-sm text-ink-light">Your feedback helps us improve SortMail.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="h-12 px-6 rounded-xl border border-border hover:bg-paper-mid transition-colors flex items-center gap-2 text-ink-light hover:text-success">
                                    <ThumbsUp size={18} />
                                    Yes
                                </button>
                                <button className="h-12 px-6 rounded-xl border border-border hover:bg-paper-mid transition-colors flex items-center gap-2 text-ink-light hover:text-danger">
                                    <ThumbsDown size={18} />
                                    No
                                </button>
                            </div>
                        </div>
                    </main>

                    {/* Sidebar / Related */}
                    <aside className="w-full lg:w-72 space-y-8">
                        <div className="card p-6 space-y-4">
                            <h3 className="font-display font-bold text-ink">In this category</h3>
                            <div className="space-y-2">
                                <Link href="#" className="block text-sm text-accent font-medium">{article.title}</Link>
                                <Link href="#" className="block text-sm text-ink-light hover:text-ink transition-colors">Setting up your profile</Link>
                                <Link href="#" className="block text-sm text-ink-light hover:text-ink transition-colors">Customizing AI tone</Link>
                                <Link href="#" className="block text-sm text-ink-light hover:text-ink transition-colors">Managing connected inboxes</Link>
                            </div>
                        </div>

                        <div className="card p-6 bg-accent/5 border-accent/10 space-y-4">
                            <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center text-white">
                                <Share2 size={18} />
                            </div>
                            <h3 className="font-display font-bold text-ink">Share Knowledge</h3>
                            <p className="text-xs text-ink-light leading-relaxed">
                                Share this article with your team members to help them get started faster.
                            </p>
                            <button className="text-sm font-bold text-accent hover:underline flex items-center gap-2">
                                Copy Share Link
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            <style jsx global>{`
                .article-content h2 {
                    font-family: var(--font-display, sans-serif);
                    font-size: 1.5rem;
                    color: #0d0d0d;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }
                .article-content p {
                    margin-bottom: 1.25rem;
                }
                .article-content ul, .article-content ol {
                    margin-bottom: 1.25rem;
                    padding-left: 1.5rem;
                }
                .article-content li {
                    margin-bottom: 0.5rem;
                }
                .article-content blockquote {
                    padding: 1rem 1.5rem;
                    border-left: 4px solid #f97316;
                    background: #fff7ed;
                    border-radius: 0.5rem;
                    margin: 2rem 0;
                    color: #444;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}
