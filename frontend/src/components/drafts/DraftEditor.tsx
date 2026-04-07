import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmailThreadV1 } from '@/types/dashboard';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface DraftEditorProps {
    content: string;
    onUpdateContent: (text: string) => void;
    originalThread: EmailThreadV1 | null;
    isGenerating: boolean;
    onRegenerate: () => void;
    isLoading?: boolean;
}

export function DraftEditor({
    content,
    onUpdateContent,
    originalThread,
    isGenerating,
    onRegenerate,
    isLoading
}: DraftEditorProps) {
    const [copied, setCopied] = React.useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const recipient = originalThread ? originalThread.participants.find(p => p !== 'you@company.com') || 'Recipient Entity' : 'Target Entity';
    const subject = originalThread ? `Re: ${originalThread.subject}` : 'Intelligence Synthesis';

    const placeholders = (content.match(/\[.*?\]/g) || []).length;

    return (
        <div className="flex flex-col h-full bg-surface-container-lowest relative">
            {isLoading && (
                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-md flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 bg-primary-fixed/20 rounded-[24px] flex items-center justify-center text-primary border border-primary/10 shadow-xl">
                            <MaterialSymbol icon="sync" className="text-3xl animate-spin" />
                        </div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest">Querying Intelligence...</p>
                    </div>
                </div>
            )}

            {/* Header Metadata */}
            <div className="px-6 md:px-12 py-8 bg-white border-b border-outline-variant/10 shadow-sm z-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-surface-container text-outline-variant font-black text-[9px] rounded-full uppercase tracking-tighter border border-outline-variant/5">Target</div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary-fixed/10 text-primary flex items-center justify-center">
                                <MaterialSymbol icon="account_circle" className="text-lg" />
                            </div>
                            <span className="text-sm font-bold text-on-surface">{recipient}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-surface-container text-outline-variant font-black text-[9px] rounded-full uppercase tracking-tighter border border-outline-variant/5">Subject</div>
                        <h1 className="text-xl md:text-2xl font-headline font-bold text-on-surface tracking-tight truncate">{subject}</h1>
                    </div>
                </div>
            </div>

            {/* Editor Canvas */}
            <ScrollArea className="flex-1">
                <div className="px-6 md:px-12 py-10 max-w-4xl mx-auto min-h-[500px]">
                    {isGenerating ? (
                        <div className="space-y-6 animate-pulse transition-opacity">
                            <div className="h-5 bg-surface-container rounded-2xl w-4/5"></div>
                            <div className="h-5 bg-surface-container rounded-2xl w-full"></div>
                            <div className="h-5 bg-surface-container rounded-2xl w-11/12"></div>
                            <div className="h-5 bg-surface-container rounded-2xl w-2/3"></div>
                        </div>
                    ) : content ? (
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => onUpdateContent(e.target.value)}
                            className="w-full min-h-[400px] border-none shadow-none focus:ring-0 p-0 text-base md:text-lg leading-[1.8] resize-none bg-transparent font-body text-on-surface placeholder:text-outline-variant placeholder:italic"
                            placeholder="Copilot response will materialize here..."
                            spellCheck={false}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white/50 border-2 border-dashed border-outline-variant/15 rounded-[40px] max-w-3xl mx-auto">
                            <div className="h-20 w-20 bg-surface-container rounded-3xl flex items-center justify-center text-outline-variant">
                                <MaterialSymbol icon="edit_note" className="text-4xl" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-headline font-bold text-on-surface">Canvas Ready</h2>
                                <p className="text-sm text-on-surface-variant max-w-xs font-medium">Configure your response objectives on the left to begin synthesis.</p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Action Matrix */}
            <div className="border-t border-outline-variant/10 bg-white/90 backdrop-blur-xl p-5 sticky bottom-0 z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {placeholders > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-error-container text-error rounded-2xl border border-error/10 animate-pulse-slow font-black text-[10px] uppercase tracking-widest shadow-sm">
                                <MaterialSymbol icon="warning" className="text-base" />
                                {placeholders} Placeholder{placeholders !== 1 ? 's' : ''} detected
                            </div>
                        )}
                        <button 
                            onClick={onRegenerate} 
                            disabled={!content || isGenerating} 
                            className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-xl text-xs font-black text-outline uppercase tracking-widest transition-all disabled:opacity-30"
                        >
                            <MaterialSymbol icon="refresh" className={`text-lg ${isGenerating ? 'animate-spin' : ''}`} />
                            Iterate
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleCopy} 
                            disabled={!content} 
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${copied ? 'bg-primary-fixed/20 border-primary-fixed text-primary' : 'bg-surface-container-low border-outline-variant/15 text-on-surface hover:bg-white hover:shadow-lg'}`}
                        >
                            <MaterialSymbol icon={copied ? "check_circle" : "content_copy"} className="text-lg" />
                            {copied ? 'Captured' : 'Capture'}
                        </button>
                        
                        <button
                            disabled={!content || !originalThread?.external_id}
                            onClick={() => {
                                if (originalThread?.external_id) {
                                    const gmailId = originalThread.external_id.replace('thread-', '');
                                    window.open(`https://mail.google.com/mail/u/0/#all/${gmailId}`, '_blank');
                                }
                            }}
                            className="flex items-center gap-3 px-6 py-2.5 bg-on-surface text-surface rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-on-surface/90 hover:shadow-xl hover:shadow-black/10 active:scale-[0.98] transition-all disabled:opacity-30"
                        >
                            <MaterialSymbol icon="launch" className="text-lg" />
                            Finalize in Gmail
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
