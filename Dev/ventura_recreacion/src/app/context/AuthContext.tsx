import { createContext, useContext, useState, useEffect } from 'react';

type User = {
    _id: string;
    name: string;
    email: string;
    availability: string[];
};

type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = async (email: string, password: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);