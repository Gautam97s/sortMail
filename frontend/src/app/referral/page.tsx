'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Users, Gift, Share2 } from 'lucide-react';

export default function ReferralPage() {
    const [referralCode] = useState('SORT-GTM-2026');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`https://sortmail.ai/signup?ref=${referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppShell title="Referrals" subtitle="Invite friends and earn rewards">
            <div className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className="font-display text-3xl text-ink">Share the intelligence</h1>
                    <p className="text-ink-light max-w-lg mx-auto">
                        Refer your colleagues or friends to SortMail. When they sign up, you both get premium credits.
                    </p>
                </div>

                {/* Referral Link Card */}
                <Card className="border-accent/20 bg-accent/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-accent" />
                            Your Personal Link
                        </CardTitle>
                        <CardDescription>
                            Share this link with your network to start earning rewards.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={`https://sortmail.ai/signup?ref=${referralCode}`}
                                className="font-mono bg-paper"
                            />
                            <Button
                                onClick={copyToClipboard}
                                className="shrink-0 gap-2"
                                variant={copied ? "outline" : "default"}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 text-success" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy Link
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-paper-mid flex items-center justify-center">
                                <Users className="h-6 w-6 text-info" />
                            </div>
                            <div>
                                <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Total Referrals</p>
                                <p className="text-2xl font-display">0</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-paper-mid flex items-center justify-center">
                                <Gift className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Rewards Earned</p>
                                <p className="text-2xl font-display">$0.00</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reward Tiers */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl">Reward Tiers</h2>
                    <div className="grid gap-4">
                        {[
                            { title: 'Bronze Scholar', requirement: '1 Referral', reward: '500 AI Credits', icon: '🥉' },
                            { title: 'Silver Sentinel', requirement: '5 Referrals', reward: '1 Month Pro Free', icon: '🥈' },
                            { title: 'Gold Guardian', requirement: '10 Referrals', reward: 'Lifetime 20% Discount', icon: '🥇' },
                        ].map((tier, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-paper-mid transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{tier.icon}</span>
                                    <div>
                                        <p className="font-medium">{tier.title}</p>
                                        <p className="text-sm text-muted-foreground">{tier.requirement}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-mono text-accent">{tier.reward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
