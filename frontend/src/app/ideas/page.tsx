'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lightbulb, Plus, Trash2, Share2 } from 'lucide-react';

export default function IdeasPage() {
    const [ideas, setIdeas] = useState([
        {
            id: '1',
            title: 'Follow up on project proposal',
            description: 'Send email to Sarah about Q3 project proposal status',
            source: 'Email from Sarah',
            createdAt: new Date('2026-03-30'),
        },
        {
            id: '2',
            title: 'Schedule team standup',
            description: 'Organize weekly team meeting for next Monday',
            source: 'Calendar event',
            createdAt: new Date('2026-03-29'),
        },
    ]);

    const handleDelete = (id: string) => {
        setIdeas(ideas.filter(idea => idea.id !== id));
    };

    return (
        <AppShell title="Ideas">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Ideas</h2>
                        <p className="text-slate-500 mt-1">Your AI-extracted ideas and action items</p>
                    </div>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        New Idea
                    </Button>
                </div>

                <div className="space-y-4">
                    {ideas.length === 0 ? (
                        <Card className="border-slate-200">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Lightbulb className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-slate-500 text-lg font-medium">No ideas yet</p>
                                <p className="text-slate-400 text-sm">Ideas from your emails will appear here</p>
                            </CardContent>
                        </Card>
                    ) : (
                        ideas.map(idea => (
                            <Card key={idea.id} className="border-slate-200 hover:border-indigo-600/30 transition-colors">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Lightbulb className="h-5 w-5 text-indigo-600" />
                                                <h3 className="text-lg font-semibold text-slate-900">{idea.title}</h3>
                                            </div>
                                            <p className="text-slate-600 mb-2">{idea.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-slate-500">From: {idea.source}</span>
                                                <span className="text-slate-400">
                                                    {idea.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-red-600"
                                                onClick={() => handleDelete(idea.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppShell>
    );
}
