'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import { api, endpoints } from '@/lib/api';
import { CalendarSuggestionV1 } from '@/types/dashboard';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarPage() {
    const queryClient = useQueryClient();
    const [date, setDate] = useState<Date | undefined>(new Date());

    const { data: suggestions = [], isLoading } = useQuery<CalendarSuggestionV1[]>({
        queryKey: ['calendar-suggestions'],
        queryFn: async () => {
            const { data } = await api.get(endpoints.calendarSuggestions);
            return data;
        },
    });

    const accept = useMutation({
        mutationFn: (id: string) => api.post(`${endpoints.calendarSuggestions}/${id}/accept`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-suggestions'] }),
    });

    const dismiss = useMutation({
        mutationFn: (id: string) => api.delete(`${endpoints.calendarSuggestions}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-suggestions'] }),
    });

    const suggestionDates = suggestions.map(s => new Date(s.suggested_time));

    return (
        <AppShell title="Calendar Suggestions">
            <div className="flex flex-col h-full overflow-hidden">
                <div className="px-8 py-6 border-b border-border-light bg-surface-card/30">
                    <h1 className="font-display text-3xl text-ink">Calendar Suggestions</h1>
                    <p className="text-ink-light mt-1">AI-detected events from your emails.</p>
                </div>

                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* Left Panel: Suggestions */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 rounded-xl bg-paper-mid animate-pulse" />
                                ))}
                            </div>
                        ) : suggestions.length === 0 ? (
                            <Card className="p-12 text-center text-muted-foreground">
                                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">No calendar suggestions</p>
                                <p className="text-sm mt-1">AI will detect meeting requests and events from your emails here.</p>
                            </Card>
                        ) : (
                            suggestions.map((suggestion) => (
                                <Card key={suggestion.suggestion_id} className="hover:shadow-md transition-shadow group border-l-4 border-l-ai">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="secondary" className="bg-ai-soft text-ai-purple hover:bg-ai-soft/80">
                                                {Math.round(suggestion.confidence * 100)}% Confidence
                                            </Badge>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" onClick={() => dismiss.mutate(suggestion.suggestion_id)}>
                                                    <X className="h-4 w-4 text-muted-foreground hover:text-ink" />
                                                </Button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-medium text-ink mb-1">{suggestion.title}</h3>

                                        <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-3.5 w-3.5" />
                                                {format(new Date(suggestion.suggested_time), "EEEE, d MMM yyyy")}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5" />
                                                {format(new Date(suggestion.suggested_time), "h:mm a")} · {suggestion.duration_minutes} min
                                            </div>
                                            {suggestion.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {suggestion.location}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1"
                                                size="sm"
                                                onClick={() => accept.mutate(suggestion.suggestion_id)}
                                                disabled={accept.isPending}
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Add to Calendar
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => dismiss.mutate(suggestion.suggestion_id)}>
                                                Dismiss
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Right Panel: Mini Calendar */}
                    <div className="lg:w-80 border-l border-border-light p-6 shrink-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-lg"
                            modifiers={{ hasSuggestion: suggestionDates }}
                            modifiersStyles={{
                                hasSuggestion: { fontWeight: "bold", backgroundColor: "#f0e7ff", color: "#7c3aed" },
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
