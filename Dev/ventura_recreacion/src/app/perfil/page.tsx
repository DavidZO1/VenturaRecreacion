"use client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PerfilPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    // Redirigir si no está autenticado
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <div className="p-4">Cargando perfil...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Perfil de Usuario</h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Nombre:</label>
                        <p className="mt-1 text-lg text-gray-900">{user.name}</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email:</label>
                        <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Miembro desde:</label>
                        <p className="mt-1 text-lg text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                    
                    <button
                        onClick={() => router.push('/eventos')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Ver Mis Eventos
                    </button>
                </div>
            </div>
        </div>
    );
}