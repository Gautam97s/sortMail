'use client';

import React from 'react';
import { FileText, Sparkles, MessageSquare, Download, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttachmentIntel } from '@/types/dashboard';

interface AttachmentIntelCardProps {
    filename: string;
    intel: AttachmentIntel;
    onAskAI?: () => void;
}

export default function AttachmentIntelCard({ filename, intel, onAskAI }: AttachmentIntelCardProps) {
    return (
        <Card className="border-border-light bg-white hover:border-accent/20 transition-all">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-paper-mid flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-ink-light" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-sm font-medium truncate">{filename}</CardTitle>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 uppercase font-mono tracking-tighter">
                                    {intel.document_type || 'Document'}
                                </Badge>
                                {intel.importance === 'high' && (
                                    <Badge variant="destructive" className="text-[10px] px-1 py-0 uppercase font-mono tracking-tighter">
                                        Crucial
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
                <div className="p-3 rounded-lg bg-ai-soft/30 border border-ai/10">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="h-3 w-3 text-ai" />
                        <span className="text-[10px] font-mono font-bold text-ai uppercase tracking-wider">AI Summary</span>
                    </div>
                    <p className="text-xs text-ink-mid leading-relaxed">
                        {intel.summary}
                    </p>
                </div>

                {intel.key_points && intel.key_points.length > 0 && (
                    <div className="space-y-2">
                        <span className="section-label text-[10px]">Key Takeaways</span>
                        <ul className="space-y-1.5">
                            {intel.key_points.map((point, i) => (
                                <li key={i} className="text-xs text-ink-light flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs gap-2 group border-dashed hover:border-ai hover:text-ai transition-colors"
                    onClick={onAskAI}
                >
                    <MessageSquare size={12} className="group-hover:scale-110 transition-transform" />
                    Ask Assistant about this file
                </Button>
            </CardContent>
        </Card>
    );
}
