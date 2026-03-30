import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TaskFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    priorityFilter: string;
    onPriorityChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    onClearFilters: () => void;
}

export function TaskFilters({
    searchQuery,
    onSearchChange,
    priorityFilter,
    onPriorityChange,
    statusFilter,
    onStatusChange,
    onClearFilters
}: TaskFiltersProps) {
    const hasActiveFilters = searchQuery || priorityFilter !== 'all' || statusFilter !== 'all';

    return (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between py-2 md:py-4">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 bg-white/40 border-white/50 backdrop-blur-md text-ink placeholder:text-muted h-10 text-sm focus:ring-accent/50 transition-all shadow-sm"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Select value={priorityFilter} onValueChange={onPriorityChange}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white/40 backdrop-blur-md h-10 md:h-10 px-3 md:px-4 rounded-xl border-white/50 text-xs md:text-sm text-ink shadow-sm hover:bg-white/50 transition-all">
                        <div className="flex items-center gap-2 md:gap-2.5 truncate">
                            <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 text-accent shrink-0" />
                            <SelectValue placeholder="Priority" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/40 bg-white/80 backdrop-blur-xl shadow-xl">
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="do_now">Do Now</SelectItem>
                        <SelectItem value="do_today">Do Today</SelectItem>
                        <SelectItem value="can_wait">Can Wait</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full sm:w-[160px] bg-white/40 backdrop-blur-md h-10 md:h-10 px-3 md:px-4 rounded-xl border-white/50 text-xs md:text-sm text-ink shadow-sm hover:bg-white/50 transition-all">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/40 bg-white/80 backdrop-blur-xl shadow-xl">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Done</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-muted-foreground hover:text-ink"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
