import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { TaskDTOv1 } from '@/types/dashboard';

export interface TaskFilters {
    q?: string;
    status?: string;
    priority?: string;
    thread_id?: string;
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    thread_id?: string;
    source_email_id?: string;
    source_type?: string;
    task_type?: string;
    priority?: string;
    status?: string;
    deadline?: string;
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    task_type?: string;
    priority?: string;
    status?: string;
    deadline?: string | null;
}

function buildParams(filters?: TaskFilters) {
    if (!filters) return undefined;
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.thread_id) params.set('thread_id', filters.thread_id);
    const query = params.toString();
    return query ? `?${query}` : undefined;
}

export function useTasks(filters?: TaskFilters) {
    const suffix = buildParams(filters) || '';
    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: async (): Promise<TaskDTOv1[]> => {
            const { data } = await api.get(`${endpoints.tasks}${suffix}`);
            return data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useCreateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateTaskPayload): Promise<TaskDTOv1> => {
            const { data } = await api.post(endpoints.tasks, payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks'] });
            qc.invalidateQueries({ queryKey: ['threads'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            qc.invalidateQueries({ queryKey: ['nav-counts'] });
        },
    });
}

export function useUpdateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }): Promise<TaskDTOv1> => {
            const { data } = await api.patch(`${endpoints.tasks}/${taskId}`, payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks'] });
            qc.invalidateQueries({ queryKey: ['threads'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            qc.invalidateQueries({ queryKey: ['nav-counts'] });
        },
    });
}

export function useDeleteTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: string): Promise<void> => {
            await api.delete(`${endpoints.tasks}/${taskId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks'] });
            qc.invalidateQueries({ queryKey: ['threads'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            qc.invalidateQueries({ queryKey: ['nav-counts'] });
        },
    });
}
