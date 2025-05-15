// components/RegisterForm.jsx
"use client";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        setError('');
        setLoading(true);
        
        try {
            await register(name, email, password);
            router.push('/perfil'); // Redirigir al perfil después del registro exitoso
        } catch (err) {
            setError(err.message || 'Error al registrarse. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2">Nombre completo</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
            </div>
            
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
            </div>
            
            <div className="mb-4">
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
            
            <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirmar contraseña</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar contraseña"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                />
            </div>
            
            <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition 
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    );
}