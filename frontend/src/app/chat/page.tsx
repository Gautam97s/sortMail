'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Sparkles, Send, Bot, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/useUser';
import { api, endpoints } from '@/lib/api';
import { isFeatureEnabled } from '@/lib/release';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: React.ReactNode;
    timestamp: Date;
}

export default function ChatPage() {
    const { data: user } = useUser();
    const canUseChat = isFeatureEnabled('chatbot', user);
    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            timestamp: new Date(),
            content: (
                <div className="space-y-4">
                    <p className="font-semibold text-lg">Welcome to SortMail AI</p>
                    <p className="text-sm">
                        I&apos;ve indexed your inbox. I can help you summarize threads, find documents, or triage your morning emails.
                    </p>
                    <div className="p-3 bg-white/30 border border-white/50 rounded-xl space-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-80" />
                        <p className="text-sm font-medium">
                            I&apos;ve analyzed your recent messages. You have <span className="text-danger font-bold">3 urgent emails</span> regarding the project timeline.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Would you like me to draft replies or summarize the blockers?
                        </p>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/20">Draft Replies</Badge>
                            <Badge variant="outline" className="bg-white/50 text-muted cursor-pointer hover:bg-white/80">Summarize Blockers</Badge>
                        </div>
                    </div>
                </div>
            )
        }
    ]);

    const handleSend = async () => {
        const prompt = inputValue.trim();
        if (!prompt || sending) return;

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: prompt,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setSending(true);

        const assistantId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: 'Thinking...', timestamp: new Date() }]);

        try {
            const response = await fetch(`${api.defaults.baseURL}${endpoints.chat}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt }),
            });

            if (!response.body) {
                throw new Error('Chat stream unavailable');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let assistantText = '';

            const updateAssistant = (text: string) => {
                setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: text } : msg));
            };

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let boundary = buffer.indexOf('\n\n');
                while (boundary !== -1) {
                    const rawEvent = buffer.slice(0, boundary).trim();
                    buffer = buffer.slice(boundary + 2);

                    const dataLine = rawEvent.split('\n').find(line => line.startsWith('data: '));
                    const chunk = dataLine ? dataLine.slice(6) : '';

                    if (chunk === '[DONE]') {
                        updateAssistant(assistantText);
                        setSending(false);
                        return;
                    }

                    if (chunk) {
                        assistantText += chunk.replace(/\\n/g, '\n');
                        updateAssistant(assistantText);
                    }

                    boundary = buffer.indexOf('\n\n');
                }
            }
        } catch (error) {
            setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: 'I could not reach the AI backend right now.' } : msg));
        } finally {
            setSending(false);
        }
    };

    if (!canUseChat) {
        return (
            <AppShell title="AI Assistant" subtitle="Internal testing only during beta">
                <div className="max-w-2xl mx-auto p-10">
                    <div className="bg-white rounded-3xl border border-outline-variant/15 p-8 text-center space-y-3">
                        <h1 className="text-2xl font-headline font-bold text-on-surface">AI Assistant is gated for beta</h1>
                        <p className="text-sm text-on-surface-variant">
                            This feature is currently available only to internal tester accounts.
                        </p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="AI Assistant" subtitle="Your personal inbox intelligence">
            <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col px-4 md:px-6 pb-6">
                
                {/* Chat Window */}
                <div className="flex-1 glass-card flex flex-col overflow-hidden shadow-xl border border-white/60 bg-white/40 relative rounded-3xl">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-white/30 bg-white/20 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-display font-bold text-lg text-ink">SortMail AI</h2>
                                <p className="text-xs font-mono text-muted uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat History */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-8 pb-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    
                                    {/* Avatar */}
                                    <div className="shrink-0">
                                        {msg.role === 'assistant' ? (
                                            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-white border border-white/60 shadow-sm flex items-center justify-center text-xs font-bold text-ink">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`
                                        max-w-[80%] rounded-2xl px-5 py-4 text-ink shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-white border border-white/80 rounded-tr-sm' 
                                            : 'bg-white/50 border border-white/60 backdrop-blur-md rounded-tl-sm'}
                                    `}>
                                        {msg.content}
                                        <div className={`text-[10px] font-mono mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-white/30 border-t border-white/40 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-3 max-w-3xl mx-auto relative group">
                            <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-lg transition-all group-hover:bg-accent/10" />
                            <div className="relative flex-1 flex items-center bg-white/80 border border-white shadow-sm rounded-2xl px-2 py-1.5 backdrop-blur-md">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0 text-muted hover:text-ink hover:bg-black/5">
                                    <Sparkles className="h-4 w-4" />
                                </Button>
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask SortMail AI anything..."
                                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 px-2 h-10 text-sm placeholder:text-muted font-medium text-ink"
                                />
                                <Button 
                                    onClick={handleSend}
                                    size="icon" 
                                    className="h-8 w-8 rounded-full shrink-0 bg-accent hover:bg-accent2 text-white shadow-md transition-all"
                                    disabled={!inputValue.trim() || sending}
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-muted font-mono mt-3 opacity-60">
                            SortMail AI may display inaccurate info, so double-check its responses.
                        </p>
                    </div>

                </div>
            </div>
        </AppShell>
    );
}
