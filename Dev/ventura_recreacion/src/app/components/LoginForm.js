// components/LoginForm.jsx
"use client";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await login(email, password);
            router.push('/perfil'); // Redireccionar después del login exitoso
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
            </div>
            
            <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
            </div>
            
            <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
}