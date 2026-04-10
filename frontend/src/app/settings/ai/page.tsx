"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Save, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, endpoints } from "@/lib/api";

type AIPreferences = {
    model: string;
    tone: string;
    auto_draft: boolean;
    summary_length: number;
};

const MODELS = [
    { value: "bedrock-nova", label: "Bedrock Nova" },
    { value: "bedrock-llama", label: "Bedrock Llama" },
    { value: "bedrock-custom", label: "Bedrock Custom" },
];

const TONES = [
    { value: "BRIEF", label: "Brief" },
    { value: "NORMAL", label: "Normal" },
    { value: "FORMAL", label: "Formal" },
];

export default function SettingsAIPage() {
    const queryClient = useQueryClient();
    const [saved, setSaved] = useState(false);
    const [local, setLocal] = useState<AIPreferences | null>(null);

    const { data, isLoading } = useQuery<AIPreferences>({
        queryKey: ["settings-ai-preferences"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.settingsAIPreferences);
            return data;
        },
    });

    useEffect(() => {
        if (data) {
            setLocal(data);
        }
    }, [data]);

    const save = useMutation({
        mutationFn: async (payload: AIPreferences) => {
            const { data } = await api.patch(endpoints.settingsAIPreferences, payload);
            return data as AIPreferences;
        },
        onSuccess: (next) => {
            queryClient.setQueryData(["settings-ai-preferences"], next);
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        },
    });

    if (isLoading || !local) {
        return (
            <div className="max-w-4xl space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-paper-mid animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="font-display text-3xl text-ink font-bold">AI & Intelligence</h1>
                <p className="text-ink-light mt-2">Configure persisted AI behavior for your account.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" /> Model & Tone
                    </CardTitle>
                    <CardDescription>These preferences are saved to your profile and reused by assistant workflows.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-light">Model</label>
                        <Select value={local.model} onValueChange={(value) => setLocal((p) => p ? ({ ...p, model: value }) : p)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                {MODELS.map((model) => (
                                    <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-ink-light">Tone</label>
                        <Select value={local.tone} onValueChange={(value) => setLocal((p) => p ? ({ ...p, tone: value }) : p)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                {TONES.map((tone) => (
                                    <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Automation</CardTitle>
                    <CardDescription>Control proactive generation and summary compression level.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-ink">Auto Draft</p>
                            <p className="text-xs text-ink-light">Allow automatic draft generation when configured by workflow.</p>
                        </div>
                        <Switch
                            checked={local.auto_draft}
                            onCheckedChange={(checked) => setLocal((p) => p ? ({ ...p, auto_draft: checked }) : p)}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-ink">Summary Length</span>
                            <span className="font-mono text-ink-light">{local.summary_length}%</span>
                        </div>
                        <Slider
                            value={[local.summary_length]}
                            min={20}
                            max={100}
                            step={5}
                            onValueChange={([value]) => setLocal((p) => p ? ({ ...p, summary_length: value }) : p)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end items-center gap-3">
                {saved && (
                    <div className="text-sm text-success flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Saved
                    </div>
                )}
                <Button onClick={() => local && save.mutate(local)} disabled={save.isPending} className="gap-2">
                    <Save className="w-4 h-4" />
                    {save.isPending ? "Saving..." : "Save AI Preferences"}
                </Button>
            </div>
        </div>
    );
}
