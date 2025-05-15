// src/app/eventos/page.tsx
"use client";
import { useAuth } from '../context/AuthContext';
import { fetchEventos } from '../api/eventos-api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './AgendaPage.css';  // Asegúrate de que la ruta de importación sea correcta

interface Evento {
    _id: string;
    tipo: string;
    fecha: string;
    descripcion: string;
    ubicacion: string;
}

export default function EventosPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [eventos, setEventos] = useState<Evento[]>([]);
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
            } catch (err: unknown) {
                let errorMessage = 'Error al cargar eventos';
                if (err instanceof Error) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
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
        <div className="agenda-page">
            <h1>Todos los Eventos</h1>
            
            <div className="flex justify-end mb-6">
                <Link
                    href="/eventos/nuevo"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    + Crear Nuevo Evento
                </Link>
            </div>
            
            <div className="eventos-container">
                {eventos.map((evento) => {
                    const fechaEvento = new Date(evento.fecha);
                    return (
                        <div key={evento._id} className="evento-card">
                            <div className="evento-header">
                                <span className="evento-fecha">
                                    {fechaEvento.toLocaleDateString()}
                                </span>
                                <span className="evento-hora">
                                    {fechaEvento.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">{evento.tipo}</h2>
                            <p className="mb-2">{evento.descripcion}</p>
                            <p className="evento-ubicacion">{evento.ubicacion}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}