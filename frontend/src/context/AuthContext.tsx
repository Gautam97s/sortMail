import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types"; // We'll define this type
import { api } from "../services/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    checkSession: () => Promise<boolean>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const _raw = (() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url && process.env.NODE_ENV === 'production') {
        throw new Error('NEXT_PUBLIC_API_URL must be set in production');
    }
    return url || 'https://sortmail-production.up.railway.app';
})();
const API_URL = /localhost|127\.0\.0\.1/.test(_raw)
    ? _raw
    : _raw.replace(/^http:\/\//, 'https://');

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkSession = async () => {
        try {
            console.log("🔍 Checking Session...");
            const res = await fetch(`${API_URL}/api/auth/me`, {
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
        window.location.href = `${API_URL}/api/auth/google`;
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
