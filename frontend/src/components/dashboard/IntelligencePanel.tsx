"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { LegacyEmail, LegacyTask } from '@/types/dashboard';
import Image from 'next/image';
import _gsap from 'gsap';
const gsap = _gsap as any;

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface IntelligencePanelProps {
    email: LegacyEmail | null;
    onClose: () => void;
    onAddTask: (task: LegacyTask) => void;
}

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ email, onClose, onAddTask }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<{ summary: string[], actionItems: string[] } | null>(null);
    const [draft, setDraft] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'brief' | 'draft'>('brief');
    const [draftLoading, setDraftLoading] = useState(false);

    const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);
    const [attachmentSummary, setAttachmentSummary] = useState<string>("");
    const [isReadingAttachment, setIsReadingAttachment] = useState(false);

    // Panel Entry/Exit Animation
    useEffect(() => {
        if (email) {
            gsap.fromTo(panelRef.current,
                { x: '100%', opacity: 0.8 },
                { x: '0%', opacity: 1, duration: 0.4, ease: "expo.out" }
            );
            setAnalysis(null);
            setDraft('');
            setActiveTab('brief');
            if (email.attachments && email.attachments.length > 0) {
                setActiveAttachmentId(email.attachments[0].id);
            } else {
                setActiveAttachmentId(null);
            }
            setAttachmentSummary("");
            runAnalysisSimulation(email);
        }
    }, [email]);

    useEffect(() => {
        if (activeAttachmentId && email?.attachments) {
            const attachment = email.attachments.find(a => a.id === activeAttachmentId);
            if (attachment) {
                setIsReadingAttachment(true);
                setAttachmentSummary("");
                
                setTimeout(() => {
                    setIsReadingAttachment(false);
                    const mockSummary = attachment.type === 'pdf'
                        ? "Protocol oversight: Q3 financial projections indicate a focus on GPU expenditure. Highlights a 15% variance due to supply chain entropy. Recommended reallocation from marketing nodes."
                        : attachment.type === 'img'
                            ? "Visual manifest: 'Winter Glow' campaign mockups. Contains 3 variants of the landing page hero section. Elements include frost textures and neon accents consistent with neural brand guidelines."
                            : "Data synthesis: Detailed line items for service agreement. Total billable hours amount to 42.5 for September. Includes server maintenance and emergency downtime support nodes.";
                    typewriteText(mockSummary);
                }, 800);
            }
        }
    }, [activeAttachmentId, email]);

    const typewriteText = (text: string) => {
        const obj = { length: 0 };
        gsap.to(obj, {
            length: text.length,
            duration: 1.2,
            ease: "none",
            onUpdate: () => {
                setAttachmentSummary(text.substring(0, Math.ceil(obj.length)));
            }
        });
    };

    const getEntitiesForAttachment = () => {
        if (!activeAttachmentId || !email?.attachments) return [];
        const attachment = email.attachments.find(a => a.id === activeAttachmentId);
        if (!attachment) return [];

        if (attachment.type === 'pdf') {
            return [
                { label: 'Classification', value: 'Financial/Strategy' },
                { label: 'Risk Factor', value: 'Medium' },
                { label: 'Pages', value: '12' }
            ];
        } else if (attachment.type === 'img') {
            return [
                { label: 'Format', value: 'PNG/RGBA' },
                { label: 'Dimensions', value: '1920x1080' },
                { label: 'Confidence', value: '94%' }
            ];
        }
        return [
            { label: 'Format', value: 'Plain Text' },
            { label: 'Entropy', value: 'Low' }
        ];
    };

    useLayoutEffect(() => {
        if (!isReadingAttachment && attachmentSummary.length > 5) {
            gsap.fromTo(".att-detail-item",
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" }
            );
        }
    }, [isReadingAttachment, attachmentSummary]);

    const runAnalysisSimulation = async (currentEmail: LegacyEmail) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1400));
        setAnalysis({
            summary: [
                "Sender is requesting urgent review of Q3 objectives.",
                "Primary objective: Approval for budget reallocation.",
                "Target window: Thursday meeting synchronization."
            ],
            actionItems: [
                "Evaluate Q3 Objective Document",
                "Authorize Budget Variance Node",
                "Synchronize Thursday Calendar Slot"
            ]
        });
        setLoading(false);
    };

    useEffect(() => {
        if (analysis && !loading) {
            gsap.fromTo(".reveal-item",
                { y: 8, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: "power1.out" }
            );
        }
    }, [analysis, loading]);

    const handleCreateTask = (item: string) => {
        if (!email) return;
        const newTask: LegacyTask = {
            id: Date.now().toString(),
            title: item,
            description: '',
            sourceEmailId: email.id,
            status: 'TODO'
        };
        onAddTask(newTask);
    };

    const handleDraft = async (tone: 'FORMAL' | 'BRIEF' | 'NORMAL') => {
        if (!email) return;
        setDraftLoading(true);
        setActiveTab('draft');
        await new Promise(resolve => setTimeout(resolve, 1200));
        setDraft(`Salutations ${email.sender.split(' ')[0]},\n\nContext received regarding Q3 projections. Analysis indicates a solid foundation.\n\nI have authorized the budget node. Let's synchronize on Thursday to finalize the execution parameters.\n\nEnd Transmission,\nUser`);
        setDraftLoading(false);
    };

    if (!email) return null;

    return (
        <div
            ref={panelRef}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[520px] bg-white border-l border-outline-variant/15 shadow-2xl z-40 flex flex-col"
        >
            {/* Control Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/5 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary-fixed/20 text-primary rounded-lg flex items-center justify-center">
                        <MaterialSymbol icon="insights" className="text-xl" />
                    </div>
                    <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Intelligence Matrix</span>
                </div>
                <button onClick={onClose} className="h-10 w-10 flex items-center justify-center bg-surface-container rounded-2xl text-outline hover:text-error hover:bg-error-container/20 transition-all">
                    <MaterialSymbol icon="close" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto" ref={contentRef}>
                {/* Context Context */}
                <div className="p-8 border-b border-outline-variant/5 bg-surface-container-lowest">
                    <h2 className="text-xl font-headline font-bold text-on-surface leading-tight tracking-tight">{email.subject}</h2>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="h-8 w-8 rounded-full bg-primary-fixed/10 flex items-center justify-center overflow-hidden border border-outline-variant/10">
                            <Image src={email.avatar} alt={email.sender} width={32} height={32} className="grayscale" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-on-surface">Origin: {email.sender}</span>
                            <span className="text-[9px] font-black text-outline-variant uppercase tracking-widest">{email.timestamp}</span>
                        </div>
                    </div>
                </div>

                {/* Attachment Neural Scan */}
                {email.attachments && email.attachments.length > 0 && (
                    <div className="p-8 space-y-6 bg-surface-container-low/30 relative">
                        <div className="flex items-center gap-2">
                            <MaterialSymbol icon="database" className="text-lg text-primary" />
                            <h3 className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Spectral Attachment Scan</h3>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                            {email.attachments.map(att => (
                                <button
                                    key={att.id}
                                    onClick={() => setActiveAttachmentId(att.id)}
                                    className={`
                                        flex items-center gap-4 p-4 rounded-2xl border min-w-[200px] transition-all group
                                        ${activeAttachmentId === att.id
                                            ? 'bg-white border-primary shadow-lg ring-1 ring-primary/20'
                                            : 'bg-white/50 border-outline-variant/10 hover:border-primary-fixed/30 hover:bg-white'}
                                    `}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeAttachmentId === att.id ? 'bg-primary text-on-primary shadow-primary/20' : 'bg-surface-container text-outline'}`}>
                                        <MaterialSymbol icon={att.type === 'pdf' ? 'picture_as_pdf' : att.type === 'img' ? 'image' : 'draft'} className="text-xl" />
                                    </div>
                                    <div className="text-left overflow-hidden min-w-0">
                                        <p className="text-xs font-bold text-on-surface truncate">{att.name}</p>
                                        <p className="text-[9px] font-black text-outline-variant uppercase tracking-tighter opacity-60">{att.size}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-[32px] border border-outline-variant/10 p-6 min-h-[220px] shadow-sm relative overflow-hidden transition-all duration-700">
                            {isReadingAttachment ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="relative h-12 w-12">
                                        <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
                                        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Scanning Neural Paths...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Synthesis Mode</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-surface-container text-outline-variant font-black text-[8px] rounded uppercase">AI Verified</div>
                                    </div>

                                    <p className="text-sm font-medium text-on-surface-variant leading-relaxed italic pr-4">
                                        &ldquo;{attachmentSummary}&rdquo;
                                        <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse align-middle" />
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {getEntitiesForAttachment().map((ent: { label: string; value: string }, i: number) => (
                                            <div key={i} className="att-detail-item px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/5 text-[9px] font-black uppercase tracking-tighter flex items-center gap-2 shadow-sm">
                                                <span className="text-primary">{ent.label}:</span>
                                                <span className="text-on-surface">{ent.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleDraft('FORMAL')}
                                        className="att-detail-item w-full h-11 bg-on-surface text-surface text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-xl hover:shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <MaterialSymbol icon="auto_fix" className="text-lg" />
                                        Contextual Re-route
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tonal Segmentation */}
                <div className="flex p-1.5 mx-8 mt-8 bg-surface-container-low rounded-2xl border border-outline-variant/5 shadow-inner">
                    <button
                        onClick={() => setActiveTab('brief')}
                        className={`flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'brief' ? 'bg-white text-primary shadow-lg border border-outline-variant/5' : 'text-outline-variant hover:text-on-surface'}`}
                    >
                        <MaterialSymbol icon="description" className="text-lg" />
                        Abstract
                    </button>
                    <button
                        onClick={() => setActiveTab('draft')}
                        className={`flex-1 h-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'draft' ? 'bg-white text-primary shadow-lg border border-outline-variant/5' : 'text-outline-variant hover:text-on-surface'}`}
                    >
                        <MaterialSymbol icon="auto_fix" className="text-lg" />
                        Copilot
                    </button>
                </div>

                {/* Matrix Content */}
                <div className="px-8 py-8 pb-32">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-6">
                            <div className="h-16 w-16 bg-surface-container rounded-[24px] flex items-center justify-center border border-outline-variant/5 animate-pulse">
                                <MaterialSymbol icon="language_mind" className="text-3xl text-primary animate-spin" />
                            </div>
                            <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Connecting Neural Paths...</p>
                        </div>
                    ) : activeTab === 'brief' ? (
                        <div className="space-y-12">
                            <div className="reveal-item space-y-4">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="h-6 w-6 bg-primary-fixed/20 text-primary rounded-lg flex items-center justify-center">
                                        <MaterialSymbol icon="segment" className="text-sm" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Executive Summary</h3>
                                </div>
                                <div className="bg-white rounded-[32px] p-6 border border-outline-variant/10 shadow-sm space-y-4">
                                    {analysis?.summary?.map((point, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                            <p className="text-sm font-medium text-on-surface-variant leading-relaxed italic opacity-90">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="reveal-item space-y-4">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="h-6 w-6 bg-tertiary-fixed/20 text-tertiary rounded-lg flex items-center justify-center">
                                        <MaterialSymbol icon="playlist_add_check" className="text-sm" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Actionable Vectors</h3>
                                </div>
                                <div className="grid gap-3">
                                    {analysis?.actionItems?.map((item, i) => (
                                        <div key={i} className="group flex items-center justify-between p-4 bg-white border border-outline-variant/10 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-8 bg-surface-container rounded-xl flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                                                    <MaterialSymbol icon="check_circle" className="text-lg" />
                                                </div>
                                                <p className="text-sm font-bold text-on-surface truncate max-w-[240px] tracking-tight">{item}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCreateTask(item)}
                                                className="h-9 px-4 bg-primary text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                                            >
                                                Annex
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="reveal-item p-6 rounded-[32px] bg-primary-fixed/10 border border-primary-fixed/20 shadow-inner flex items-start gap-4">
                                <MaterialSymbol icon="verified" className="text-xl text-primary" />
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Matrix Recommendation</h4>
                                    <p className="text-xs font-semibold text-on-surface opacity-80 leading-relaxed italic">
                                        Subject demonstrates {email.urgency.toUpperCase()} urgency. Initial response suggested within 4 solar hours to maintain relationship integrity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'FORMAL', label: 'Elevated', icon: 'gavel' },
                                    { id: 'BRIEF', label: 'Incise', icon: 'bolt' },
                                    { id: 'NORMAL', label: 'Matrix', icon: 'event' }
                                ].map((t) => (
                                    <button 
                                        key={t.id}
                                        onClick={() => handleDraft(t.id as any)} 
                                        className="p-4 bg-white border border-outline-variant/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary-fixed/30 hover:shadow-lg transition-all group"
                                    >
                                        <div className="h-10 w-10 bg-surface-container rounded-xl flex items-center justify-center text-outline group-hover:bg-primary-fixed/20 group-hover:text-primary transition-all">
                                            <MaterialSymbol icon={t.icon} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-outline-variant">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {draftLoading ? (
                                <div className="h-64 rounded-[32px] bg-surface-container-lowest border border-outline-variant/10 animate-pulse flex flex-col items-center justify-center gap-4">
                                    <MaterialSymbol icon="sync" className="text-3xl text-primary animate-spin" />
                                    <span className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Synthesizing Neural Response...</span>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary-fixed/5 rounded-[32px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <div className="relative bg-white border border-outline-variant/15 rounded-[32px] p-6 shadow-sm group-focus-within:border-primary transition-all">
                                        <textarea
                                            value={draft}
                                            onChange={(e) => setDraft(e.target.value)}
                                            placeholder="Select objective or manifest manually..."
                                            className="w-full h-72 bg-transparent text-base font-body text-on-surface focus:outline-none resize-none leading-relaxed italic placeholder:text-outline-variant/40"
                                            spellCheck={false}
                                        />
                                        <div className="absolute bottom-6 right-6 flex gap-3">
                                            <button className="h-10 w-10 bg-surface-container hover:bg-primary-fixed/20 hover:text-primary rounded-xl flex items-center justify-center transition-all border border-outline-variant/5 shadow-sm" title="Capture">
                                                <MaterialSymbol icon="content_copy" className="text-lg" />
                                            </button>
                                            <button className="h-10 w-10 bg-surface-container hover:bg-primary-fixed/20 hover:text-primary rounded-xl flex items-center justify-center transition-all border border-outline-variant/5 shadow-sm" title="Re-simulate">
                                                <MaterialSymbol icon="refresh" className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button className="h-14 px-10 bg-primary text-on-primary rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.03] active:scale-[0.97] transition-all">
                                    <MaterialSymbol icon="send" className="text-xl" />
                                    Authorize Transmission
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntelligencePanel;
