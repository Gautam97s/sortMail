import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { api } from "../services/api";
import { getApiUrl } from "@/lib/config";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    checkSession: () => Promise<boolean>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const redirectToLogin = () => {
        if (typeof window === "undefined") return;

        const currentPath = window.location.pathname;
        const publicPaths = [
            '/login', '/privacy', '/terms', '/onboarding', '/help',
            '/callback', '/magic-link-sent', '/verify', '/reset-password'
        ];

        if (!publicPaths.some((path) => currentPath.startsWith(path)) && currentPath !== '/') {
            router.replace('/login');
        }
    };

    const checkSession = async () => {
        try {
            console.log("🔍 Checking Session...");
            const url = getApiUrl("/api/auth/me");
            const res = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                return true;
            } else {
                setUser(null);
                if (res.status === 401) {
                    redirectToLogin();
                }
                return false;
            }
        } catch (error) {
            console.error("Session check failed", error);
            setUser(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = () => {
        window.location.href = getApiUrl("/api/auth/google");
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            isAuthenticated: !!user, 
            login, 
            logout, 
            checkSession 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
