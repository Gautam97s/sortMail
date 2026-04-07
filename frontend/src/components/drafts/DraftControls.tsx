import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useThreads } from "@/hooks/useThreads";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface DraftControlsProps {
    selectedThreadId: string;
    onThreadChange: (threadId: string) => void;
    tone: string;
    onToneChange: (tone: string) => void;
    instructions: string;
    onInstructionsChange: (text: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export function DraftControls({
    selectedThreadId,
    onThreadChange,
    tone,
    onToneChange,
    instructions,
    onInstructionsChange,
    isGenerating,
    onGenerate
}: DraftControlsProps) {
    const { data: threads = [] } = useThreads();

    return (
        <div className="flex flex-col gap-8 p-6 h-full border-r border-outline-variant/10 bg-white w-full md:w-[400px] shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/5">
                <div className="h-12 w-12 bg-primary-fixed/20 text-primary rounded-[18px] flex items-center justify-center border border-primary/5">
                    <MaterialSymbol icon="auto_fix" className="text-2xl" />
                </div>
                <div>
                    <h2 className="font-headline text-xl text-on-surface font-bold tracking-tight">Copilot Intelligence</h2>
                    <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest">Generative Workspace</p>
                </div>
            </div>

            <div className="space-y-8 flex-1">
                {/* Thread Selector */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-outline-variant px-1">Active Communication</label>
                    <Select value={selectedThreadId || undefined} onValueChange={onThreadChange}>
                        <SelectTrigger className="w-full h-12 bg-surface-container-lowest border-outline-variant/15 text-on-surface rounded-2xl focus:ring-primary-fixed text-sm font-medium">
                            <SelectValue placeholder="Select context thread..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-outline-variant/10 shadow-2xl">
                            {threads.map((thread: any) => (
                                <SelectItem key={thread.thread_id} value={thread.thread_id} className="rounded-xl my-1 focus:bg-primary-fixed/10">
                                    <div className="flex flex-col gap-0.5 py-1">
                                        <span className="font-bold text-on-surface truncate text-sm">{thread.subject || "(Untethered Thread)"}</span>
                                        <span className="truncate text-[10px] font-medium text-on-surface-variant flex items-center gap-1.5 uppercase tracking-tighter">
                                            <MaterialSymbol icon="person" className="text-xs" />
                                            {thread.participants?.[0] || 'Anonymous Entity'}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tonal Configuration */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-outline-variant px-1">Linguistic Profile</label>
                    <div className="grid gap-2">
                        {[
                            { id: 'BRIEF', label: 'Incise', desc: 'Direct, focused communication', icon: 'bolt' },
                            { id: 'NORMAL', label: 'Balanced', desc: 'Standard professional discourse', icon: 'architecture' },
                            { id: 'FORMAL', label: 'Elevated', desc: 'Detailed, authoritative tone', icon: 'gavel' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => onToneChange(t.id)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${tone === t.id ? 'bg-white border-primary-fixed shadow-lg shadow-primary/5 ring-1 ring-primary-fixed' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary-fixed/30'}`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tone === t.id ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-outline'}`}>
                                    <MaterialSymbol icon={t.icon} />
                                </div>
                                <div className="flex flex-col pt-0.5 min-w-0">
                                    <span className={`text-sm font-bold ${tone === t.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>{t.label}</span>
                                    <span className="text-[10px] font-medium text-outline-variant truncate">{t.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Behavioral Instructions */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-outline-variant px-1">Copilot Instructions</label>
                    <textarea
                        placeholder="Define constraints or specific objectives..."
                        className="w-full min-h-[120px] p-4 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all text-sm font-medium resize-none placeholder:italic placeholder:font-normal"
                        value={instructions}
                        onChange={(e) => onInstructionsChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Action */}
            <div className="pt-6 border-t border-outline-variant/5">
                <button
                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-xs shadow-xl ${isGenerating ? 'bg-surface-container text-outline cursor-wait' : 'bg-primary text-on-primary hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'}`}
                    onClick={onGenerate}
                    disabled={!selectedThreadId || isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <MaterialSymbol icon="sync" className="animate-spin text-lg" />
                            Synthesizing...
                        </>
                    ) : (
                        <>
                            <MaterialSymbol icon="auto_fix" className="text-lg" />
                            Manifest Response
                        </>
                    )}
                </button>
                <div className="mt-4 p-3 bg-surface-container-low rounded-xl flex items-center gap-2.5 border border-outline-variant/10 text-[9px] font-bold text-outline-variant uppercase tracking-tighter">
                    <MaterialSymbol icon="verified" className="text-sm" />
                    <span>Context-aware intelligence enabled</span>
                </div>
            </div>
        </div>
    );
}
