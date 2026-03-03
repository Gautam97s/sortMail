import React, { useState } from 'react';
import Link from 'next/link';
import { useWaitingFor } from '@/hooks/useWaitingFor';
import { Clock, Send, CheckCircle, MoreHorizontal } from 'lucide-react';

const WaitingView: React.FC = () => {
    const { data: items = [], isLoading } = useWaitingFor();
    const [nudgingId, setNudgingId] = useState<string | null>(null);

    const handleNudge = (id: string) => {
        setNudgingId(id);
        // Simulate AI Nudge generation
        setTimeout(() => {
            setNudgingId(null);
            alert("AI Nudge draft created and placed in drafts.");
        }, 1500);
    };

    if (isLoading) {
        return (
            <div className="h-full p-8 flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading pending threads...</div>
            </div>
        );
    }

    return (
        <div className="h-full p-8 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Waiting For</h1>
                <p className="text-zinc-400">Threads where you are awaiting a reply.</p>
            </div>

            <div className="space-y-4 max-w-3xl">
                {items.map((item) => (
                    <Link key={item.waiting_id} href={`/inbox/${item.thread_id}`} className="block">
                        <div className="glass-panel p-5 rounded-xl flex items-center justify-between group hover:bg-[#18181B] cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                                        {item.recipient.split(/\s|@/).map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full border border-zinc-700 p-0.5">
                                        <Clock size={12} className={item.days_waiting > 4 ? "text-rose-500" : "text-amber-500"} />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-zinc-200 truncate">{item.recipient}</h3>
                                    <p className="text-sm text-zinc-500 truncate">{item.thread_subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${item.days_waiting > 4
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                    {item.days_waiting} days pending
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleNudge(item.waiting_id);
                                        }}
                                        disabled={nudgingId === item.waiting_id}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {nudgingId === item.waiting_id}
                                        {nudgingId === item.waiting_id ? (
                                            <>Generating...</>
                                        ) : (
                                            <><Send size={12} /> Nudge</>
                                        )}
                                    </button>
                                    <button className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
                                        <CheckCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-20 text-zinc-500">
                        No pending threads. You&apos;re all caught up!
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitingView;
