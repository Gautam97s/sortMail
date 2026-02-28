"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { mockPrivacyPolicy } from "@/data/settings";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

export default function PrivacyPage() {
    const content = mockPrivacyPolicy;

    return (
        <div className="min-h-screen bg-paper py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-accent transition-colors mb-12 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to home
                </Link>

                <div className="space-y-4 mb-12">
                    <div className="h-12 w-12 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-2">
                        <Shield size={24} />
                    </div>
                    <h1 className="font-display text-4xl text-ink font-bold tracking-tight">{content.title}</h1>
                    <p className="text-ink-light">Last Updated: {content.lastUpdated}</p>
                </div>

                <div className="prose prose-ink max-w-none space-y-12 text-ink-light leading-relaxed">
                    {content.sections.map((section) => {
                        return (
                            <section key={section.id} className="space-y-4">
                                <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
                                    {section.iconName && <DynamicIcon name={section.iconName} size={20} className="text-accent" />}
                                    {section.title}
                                </h2>
                                <p dangerouslySetInnerHTML={{ __html: section.content }} />
                                {section.items && (
                                    <ul className="list-disc pl-6 space-y-2">
                                        {section.items.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
                </div>

                <div className="mt-20 pt-8 border-t border-border-light text-center">
                    <p className="text-sm text-ink-light mb-4">Questions about our privacy practices?</p>
                    <a href="mailto:privacy@sortmail.ai" className="btn-secondary">Contact Privacy Team</a>
                </div>
            </div>
        </div>
    );
}
