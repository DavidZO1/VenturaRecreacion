"use client";
import { useAuth } from '../context/AuthContext';
import { fetchMisEventos, deleteEvento } from '../api/eventos-api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Evento {
    _id: string;
    tipo: string;
    fecha: string;
    descripcion: string;
    ubicacion: string;
    numInvitados: number;
    estado: string;
    precio?: number;
    motivoRechazo?: string;
}

export default function MisEventosPage() {
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
        loadEventos();
    }, [user, router]);

    const loadEventos = async () => {
        try {
            const data = await fetchMisEventos(user!.token);
            setEventos(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar eventos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            try {
                await deleteEvento(id, user!.token);
                loadEventos();
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Error al eliminar evento');
            }
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'aprobado': return 'bg-green-100 text-green-800';
            case 'rechazado': return 'bg-red-100 text-red-800';
            case 'pagado': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-4">Cargando mis eventos...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Mis Eventos</h1>
                <Link
                    href="/eventos/nuevo"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Crear Evento
                </Link>
            </div>
            
            {eventos.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tienes eventos creados</p>
                    <Link
                        href="/eventos/nuevo"
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Crear tu primer evento
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {eventos.map((evento) => (
                        <div key={evento._id} className="border rounded-lg p-4 bg-white shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-semibold">{evento.tipo}</h2>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(evento.estado)}`}>
                                    {evento.estado.toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                    <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                                    <p><strong>Invitados:</strong> {evento.numInvitados}</p>
                                    {evento.precio && <p><strong>Precio:</strong> ${evento.precio}</p>}
                                </div>
                                
                                <div>
                                    {evento.descripcion && <p><strong>Descripción:</strong> {evento.descripcion}</p>}
                                    {evento.motivoRechazo && (
                                        <p className="text-red-600"><strong>Motivo de rechazo:</strong> {evento.motivoRechazo}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-4 flex space-x-2">
                                {evento.estado === 'pendiente' && (
                                    <>
                                        <Link
                                            href={`/eventos/editar/${evento._id}`}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(evento._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                                {evento.estado === 'aprobado' && (
                                    <span className="text-green-600 text-sm">Evento aprobado - Esperando pago</span>
                                )}
                                {evento.estado === 'pagado' && (
                                    <span className="text-blue-600 text-sm">Evento confirmado y pagado</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}