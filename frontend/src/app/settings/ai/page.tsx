"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function SettingsAIPage() {
    const [settings, setSettings] = useState({
        model: "gpt-4",
        tone: "NORMAL",
        autoDraft: true,
        summaryLength: 50,
    });

    const handleSave = () => {
        // Save settings
        console.log("Saving AI settings:", settings);
    };

    return (
        <div className="max-w-4xl space-y-12">
            <div className="space-y-1">
                <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Intelligence Configuration</h1>
                <p className="text-sm font-medium text-on-surface-variant opacity-80">Refine neural processing parameters and synthesis objectives.</p>
            </div>

            <div className="space-y-8">
                {/* AI Model Selection */}
                <div className="bg-white rounded-[40px] border border-outline-variant/10 p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary-fixed/20 text-primary rounded-xl flex items-center justify-center">
                            <MaterialSymbol icon="model_training" />
                        </div>
                        <div>
                            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-widest text-[10px]">Neural Architecture</h3>
                            <p className="text-xs font-medium text-on-surface-variant">Select the primary engine for semantic analysis.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: "gpt-4", name: "GPT-4.0", desc: "Maximum Context", icon: "diamond" },
                            { id: "gpt-3.5", name: "Turbo", desc: "Low Latency", icon: "bolt" },
                            { id: "claude", name: "Claude 3", desc: "High Precision", icon: "cognition" },
                        ].map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setSettings({ ...settings, model: model.id })}
                                className={`
                                    p-5 rounded-[24px] border-2 transition-all text-left flex flex-col gap-3 group
                                    ${settings.model === model.id
                                        ? "border-primary bg-primary-fixed/10 ring-1 ring-primary-fixed shadow-lg"
                                        : "border-outline-variant/10 hover:border-primary-fixed/30 bg-surface-container-lowest"
                                    }
                                `}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${settings.model === model.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}>
                                    <MaterialSymbol icon={model.icon} className="text-xl" />
                                </div>
                                <div>
                                    <div className="font-bold text-on-surface text-sm">{model.name}</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter text-outline-variant opacity-60">{model.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Synthesis Tone */}
                <div className="bg-white rounded-[40px] border border-outline-variant/10 p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-tertiary-fixed/20 text-tertiary rounded-xl flex items-center justify-center">
                            <MaterialSymbol icon="architecture" />
                        </div>
                        <div>
                            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-widest text-[10px]">Linguistic Tonal Profile</h3>
                            <p className="text-xs font-medium text-on-surface-variant">Default synthesis style for generated communications.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: "BRIEF", name: "Incise", desc: "Minimalist", icon: "short_text" },
                            { id: "NORMAL", name: "Balanced", desc: "Standard", icon: "format_align_left" },
                            { id: "FORMAL", name: "Elevated", desc: "Authoritative", icon: "gavel" },
                        ].map((tone) => (
                            <button
                                key={tone.id}
                                onClick={() => setSettings({ ...settings, tone: tone.id })}
                                className={`
                                    p-5 rounded-[24px] border-2 transition-all text-left flex flex-col gap-3 group
                                    ${settings.tone === tone.id
                                        ? "border-tertiary-fixed bg-tertiary-fixed/10 ring-1 ring-tertiary-fixed shadow-lg"
                                        : "border-outline-variant/10 hover:border-tertiary-fixed/30 bg-surface-container-lowest"
                                    }
                                `}
                            >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${settings.tone === tone.id ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-outline'}`}>
                                    <MaterialSymbol icon={tone.icon} className="text-xl" />
                                </div>
                                <div>
                                    <div className="font-bold text-on-surface text-sm">{tone.name}</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter text-outline-variant opacity-60">{tone.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Automation Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[40px] border border-outline-variant/10 p-8 flex items-center justify-between shadow-sm hover:border-primary-fixed/20 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 bg-primary-fixed/10 text-primary rounded-2xl flex items-center justify-center border border-primary/5">
                                <MaterialSymbol icon="auto_mode" filled />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-on-surface tracking-tight">Autonomous Drafting</h3>
                                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-tighter">Proactive synthesis</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.autoDraft}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, autoDraft: checked })
                            }
                            className="bg-surface-container-high"
                        />
                    </div>

                    <div className="bg-white rounded-[40px] border border-outline-variant/10 p-8 flex items-center justify-between shadow-sm hover:border-primary-fixed/20 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 bg-secondary-fixed/10 text-secondary rounded-2xl flex items-center justify-center border border-secondary/5">
                                <MaterialSymbol icon="verified" filled />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-on-surface tracking-tight">Confidence Scores</h3>
                                <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-tighter">Analysis metadata</p>
                            </div>
                        </div>
                        <Switch checked={true} className="bg-surface-container-high" />
                    </div>
                </div>

                {/* Abstract Compression (Summary Length) */}
                <div className="bg-white rounded-[40px] border border-outline-variant/10 p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-surface-container-high text-on-surface rounded-xl flex items-center justify-center">
                            <MaterialSymbol icon="compress" />
                        </div>
                        <div>
                            <h3 className="text-sm font-headline font-bold text-on-surface uppercase tracking-widest text-[10px]">Neural Compression Ratio</h3>
                            <p className="text-xs font-medium text-on-surface-variant">Degree of abstraction in email summarization.</p>
                        </div>
                    </div>
                    
                    <div className="px-4 py-8 bg-surface-container-low rounded-[32px] space-y-8 border border-outline-variant/5">
                        <Slider
                            value={[settings.summaryLength]}
                            onValueChange={([value]) =>
                                setSettings({ ...settings, summaryLength: value })
                            }
                            min={20}
                            max={100}
                            step={10}
                            className="w-full"
                        />
                        <div className="flex justify-between items-center text-[10px] font-black text-outline-variant uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <MaterialSymbol icon="unfold_less" className="text-sm" />
                                Dense Macro
                            </div>
                            <div className="text-primary bg-primary-fixed/20 px-3 py-1 rounded-full text-xs">{settings.summaryLength}% Analysis</div>
                            <div className="flex items-center gap-2 text-right">
                                Detailed Micro
                                <MaterialSymbol icon="unfold_more" className="text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Execution */}
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        className="h-14 px-10 bg-on-surface text-surface rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-on-surface/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <MaterialSymbol icon="save" className="text-xl" />
                        Commit Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
