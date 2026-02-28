'use client';

import { useState, useCallback } from 'react';
import { useThreadIntel } from './useThreadIntel';

/**
 * Provides context-aware AI interactions for the current thread.
 * Manages local state for AI chat and contextual suggestions.
 */
export function useThreadContext(threadId: string) {
    const { data: intel, isLoading } = useThreadIntel(threadId);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content }]);
        setIsTyping(true);

        // Simulate AI response based on thread context
        try {
            // In a real app, this would be an API call like:
            // const response = await aiApi.chat(threadId, content, messages);

            await new Promise(resolve => setTimeout(resolve, 1500));

            let aiResponse = "I'm analyzing the thread context...";
            if (intel) {
                if (content.toLowerCase().includes('summary')) {
                    aiResponse = `According to my analysis: ${intel.summary}`;
                } else if (content.toLowerCase().includes('task') || content.toLowerCase().includes('action')) {
                    aiResponse = `The main asks from this thread are: ${intel.main_ask || 'Not explicitly stated, but I suggest focusing on the latest reply.'}`;
                } else {
                    aiResponse = `I see this thread is about "${intel.intent}". Based on the summary, ${intel.summary.slice(0, 100)}... How else can I help?`;
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI intelligence layer right now." }]);
        } finally {
            setIsTyping(false);
        }
    }, [intel]);

    const clearChat = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        intel,
        isLoading,
        messages,
        isTyping,
        sendMessage,
        clearChat
    };
}
