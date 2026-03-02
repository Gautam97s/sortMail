import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { UserProfile } from '@/types/dashboard';

// We map the backend UserDTO to the frontend UserProfile structure
export async function fetchCurrentUser(): Promise<UserProfile> {
    const { data } = await api.get('/api/auth/me');

    // Map backend `plan` to frontend `plan` (free, pro, enterprise)
    let mappedPlan: 'free' | 'pro' | 'enterprise' = 'free';
    if (data.plan === 'pro') mappedPlan = 'pro';
    if (data.plan === 'enterprise') mappedPlan = 'enterprise';

    return {
        id: data.id,
        name: data.name || 'Anonymous',
        email: data.email,
        avatar: data.picture || `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=random`,
        role: data.is_superuser ? 'admin' : 'user',
        plan: mappedPlan,
        credits: data.credits || 0
    };
}

export function useUser() {
    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: fetchCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}
