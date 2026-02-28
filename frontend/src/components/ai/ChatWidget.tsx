'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Minimize2, Maximize2, MessageSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThreadContext } from '@/hooks/useThreadContext';
import ChatMessage from './ChatMessage';

interface ChatWidgetProps {
    threadId: string;
}

export default function ChatWidget({ threadId }: ChatWidgetProps) {
    const { messages, isTyping, sendMessage, intel } = useThreadContext(threadId);
    const [input, setInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim() || isTyping) return;
        sendMessage(input);
        setInput('');
    };

    if (!isExpanded) {
        return (
            <Button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-24 right-8 w-14 h-14 rounded-full shadow-2xl bg-ai hover:bg-ai-deep text-white flex items-center justify-center p-0 group animate-in zoom-in duration-300"
            >
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-8 right-8 w-[380px] h-[520px] shadow-2xl border-ai/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500 z-50">
            <CardHeader className="bg-ai text-white p-4 py-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <CardTitle className="text-sm font-display tracking-wide">SortMail Assistant</CardTitle>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setIsExpanded(false)}
                    >
                        <Minimize2 size={14} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-paper">
                <ScrollArea className="flex-1">
                    <div ref={scrollRef} className="p-4 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-ai/10 flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-ai" />
                                </div>
                                <div>
                                    <h3 className="font-display text-base">How can I help with this thread?</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Ask about deadlines, summaries, or specific details.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full pt-4">
                                    {[
                                        'Summarize this thread',
                                        'What are the action items?',
                                        'Is there a deadline mentioned?'
                                    ].map((suggestion, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="text-[11px] h-8 justify-start font-normal border-border-light hover:border-ai hover:text-ai"
                                            onClick={() => sendMessage(suggestion)}
                                        >
                                            &quot;{suggestion}&quot;
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <ChatMessage key={i} role={msg.role} content={msg.content} />
                            ))
                        )}
                        {isTyping && (
                            <div className="flex gap-3 mb-4 animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center border border-ai/20">
                                    <Sparkles size={14} className="text-ai animate-pulse" />
                                </div>
                                <div className="bg-paper-mid border border-border-light rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ai/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-ai/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-ai/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border-light bg-white">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    >
                        <Input
                            placeholder="Ask the Assistant..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="text-sm h-10 border-border-light focus-visible:ring-ai"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || isTyping}
                            className="bg-ai hover:bg-ai-deep text-white h-10 w-10 shrink-0"
                        >
                            <Send size={16} />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
