export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    provider: string;
    is_active: boolean;
    is_superuser: boolean;
    credits: number;
    created_at: string;
    updated_at: string;
}
