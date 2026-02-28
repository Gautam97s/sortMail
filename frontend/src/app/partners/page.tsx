'use client';

import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Rocket, DollarSign, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PartnersPage() {
    return (
        <AppShell title="Partners" subtitle="Grow with SortMail Intelligence">
            <div className="p-6 max-w-5xl mx-auto space-y-12">

                {/* Hero */}
                <div className="text-center space-y-4 py-8">
                    <Badge variant="secondary" className="px-4 py-1 text-xs uppercase tracking-widest font-mono text-accent bg-accent/10 border-accent/20">SortMail Partner Program</Badge>
                    <h1 className="font-display text-4xl md:text-5xl text-ink max-w-2xl mx-auto leading-tight">
                        Empower your clients with <span className="italic text-accent">AI Intelligence</span>
                    </h1>
                    <p className="text-ink-light text-lg max-w-xl mx-auto">
                        Join our ecosystem of consultants, agencies, and developers building the future of work.
                    </p>
                    <div className="pt-4">
                        <Button className="btn-primary px-8 py-6 text-lg h-auto">Apply for Partnership <ArrowRight className="ml-2 h-5 w-5" /></Button>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: DollarSign,
                            title: 'Generous Rev-Share',
                            desc: 'Earn 30% recurring commission for every customer you bring for the first 12 months.',
                            color: 'text-success'
                        },
                        {
                            icon: Rocket,
                            title: 'Co-Marketing',
                            desc: 'Get featured on our partner directory and collaborate on case studies and webinars.',
                            color: 'text-ai'
                        },
                        {
                            icon: Globe,
                            title: 'Priority Support',
                            desc: 'Direct access to our engineering team and early access to new AI features.',
                            color: 'text-info'
                        }
                    ].map((benefit, i) => (
                        <Card key={i} className="border-none bg-paper-mid overflow-hidden group">
                            <CardContent className="p-8 space-y-4">
                                <div className={`w-12 h-12 rounded-xl bg-paper flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                                </div>
                                <h3 className="text-xl font-display">{benefit.title}</h3>
                                <p className="text-sm text-ink-light leading-relaxed">{benefit.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tiers / Programs */}
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="font-display text-3xl">Program Tracks</h2>
                        <p className="text-muted-foreground mt-2">Choose the track that fits your business</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-border hover:shadow-xl transition-shadow overflow-hidden">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-display flex items-center gap-2">
                                    <Rocket className="h-6 w-6 text-accent" />
                                    Affiliates
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    For content creators, bloggers, and influencers who love productivity tools.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-6 space-y-6">
                                <ul className="space-y-3">
                                    {[
                                        '30% lifetime commission',
                                        '90-day cookie window',
                                        'Marketing asset library',
                                        'Monthly payouts'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="w-full">Join as Affiliate</Button>
                            </CardContent>
                        </Card>

                        <Card className="border-accent/40 bg-accent/5 hover:shadow-xl transition-shadow overflow-hidden">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-display flex items-center gap-2">
                                    <Users className="h-6 w-6 text-accent" />
                                    Solutions Partners
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    For agencies and consultants implementing SortMail for their clients.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-6 space-y-6">
                                <ul className="space-y-3">
                                    {[
                                        'Bulk pricing discounts',
                                        'Whitelabel reporting',
                                        'Dedicated channel manager',
                                        'Implementation certification'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full bg-accent hover:bg-accent-hover text-white">Apply for Agency Program</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FAQ / Simple CTA */}
                <div className="bg-paper-mid rounded-3xl p-10 text-center space-y-6 border border-border">
                    <h3 className="font-display text-2xl">Questions about the program?</h3>
                    <p className="text-ink-light max-w-lg mx-auto">
                        Check our <a href="/help" className="text-accent hover:underline font-medium">Partner FAQ</a> or reach out to our team at <span className="text-ink font-mono font-medium">partners@sortmail.ai</span>
                    </p>
                </div>
            </div>
        </AppShell>
    );
}
