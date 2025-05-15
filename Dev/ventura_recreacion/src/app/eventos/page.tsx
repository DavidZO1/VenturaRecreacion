// src/app/eventos/page.tsx
"use client";
import { useAuth } from '../context/AuthContext';
import { fetchEventos } from '../api/eventos-api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const loadEventos = async () => {
            try {
                const data = await fetchEventos();
                setEventos(data);
            } catch (err) {
                setError(err.message || 'Error al cargar eventos');
            } finally {
                setLoading(false);
            }
        };

        loadEventos();
    }, [user, router]);

    if (loading) {
        return <div className="p-4">Cargando eventos...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Todos los Eventos</h1>
            
            <div className="grid gap-4">
                {eventos.map((evento) => (
                    <div key={evento._id} className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">{evento.tipo}</h2>
                        <p className="text-gray-600">{new Date(evento.fecha).toLocaleDateString()}</p>
                        <p className="mt-2">{evento.descripcion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}