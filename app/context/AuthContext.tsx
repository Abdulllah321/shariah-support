"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    employeeId: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        // Check session on load
        const session = localStorage.getItem("session");
        if (session) {
            const parsedSession = JSON.parse(session);
            if (Date.now() < parsedSession.expiry) {
                setUser({ employeeId: parsedSession.employeeId, username: parsedSession.username });
            } else {
                localStorage.removeItem("session");
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = (userData: User) => {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7-day session
        localStorage.setItem("session", JSON.stringify({ ...userData, expiry }));
        setUser(userData);
        router.replace("/");
    };
    

    // Logout function
    const logout = () => {
        localStorage.removeItem("session");
        setUser(null);
        router.replace("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy usage
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
