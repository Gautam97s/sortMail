'use client';

import React from 'react';
import { Sparkles, User } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isAi = role === 'assistant';

    return (
        <div className={`flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                ${isAi ? 'bg-ai/10 text-ai border border-ai/20' : 'bg-accent/10 text-accent border border-accent/20'}
            `}>
                {isAi ? <Sparkles size={14} /> : <User size={14} />}
            </div>

            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${isAi
                    ? 'bg-paper-mid border border-border-light text-ink-mid rounded-tl-none'
                    : 'bg-accent text-white rounded-tr-none'
                }
            `}>
                {content}
            </div>
        </div>
    );
}
