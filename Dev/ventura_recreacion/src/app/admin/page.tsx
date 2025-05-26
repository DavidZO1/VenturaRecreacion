"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEventosPendientes, fetchAgendaMensual, aprobarEvento, rechazarEvento } from '../api/eventos-api';

interface Evento {
    _id: string;
    tipo: string;
    fecha: string;
    ubicacion: string;
    descripcion: string;
    numInvitados: number;
    usuario: { name: string; email: string };
    estado: string;
    precio?: number;
}

export default function AdminPanel() {
    const { user } = useAuth();
    const [eventosPendientes, setEventosPendientes] = useState<Evento[]>([]);
    const [agendaMensual, setAgendaMensual] = useState<Evento[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pendientes');

    useEffect(() => {
        if (user?.role === 'admin') {
            loadData();
        }
    }, [user, currentDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [pendientes, agenda] = await Promise.all([
                fetchEventosPendientes(user!.token),
                fetchAgendaMensual(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    user!.token
                )
            ]);
            setEventosPendientes(pendientes);
            setAgendaMensual(agenda);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id: string, precio: number) => {
        try {
            await aprobarEvento(id, precio, '', user!.token);
            loadData();
        } catch (error) {
            console.error('Error aprobando evento:', error);
        }
    };

    const handleRechazar = async (id: string, motivo: string) => {
        try {
            await rechazarEvento(id, motivo, user!.token);
            loadData();
        } catch (error) {
            console.error('Error rechazando evento:', error);
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const changeMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    if (user?.role !== 'admin') {
        return <div className="p-4">Acceso denegado. Solo administradores.</div>;
    }

    if (loading) return <div className="p-4">Cargando...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
            
            <div className="flex mb-6 border-b">
                <button
                    onClick={() => setActiveTab('pendientes')}
                    className={`px-4 py-2 mr-4 ${activeTab === 'pendientes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                >
                    Eventos Pendientes ({eventosPendientes.length})
                </button>
                <button
                    onClick={() => setActiveTab('agenda')}
                    className={`px-4 py-2 ${activeTab === 'agenda' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                >
                    Agenda Mensual
                </button>
            </div>

            {activeTab === 'pendientes' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Eventos Pendientes de Aprobación</h2>
                    {eventosPendientes.length === 0 ? (
                        <p className="text-gray-500">No hay eventos pendientes</p>
                    ) : (
                        eventosPendientes.map((evento) => (
                            <div key={evento._id} className="border rounded-lg p-4 bg-white shadow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-blue-600">{evento.tipo}</h3>
                                        <p><strong>Fecha:</strong> {formatFecha(evento.fecha)}</p>
                                        <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                                        <p><strong>Invitados:</strong> {evento.numInvitados}</p>
                                        <p><strong>Cliente:</strong> {evento.usuario.name} ({evento.usuario.email})</p>
                                        {evento.descripcion && <p><strong>Descripción:</strong> {evento.descripcion}</p>}
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                placeholder="Precio"
                                                className="border rounded px-2 py-1 flex-1"
                                                id={`precio-${evento._id}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const precio = (document.getElementById(`precio-${evento._id}`) as HTMLInputElement)?.value;
                                                    handleAprobar(evento._id, parseFloat(precio) || 0);
                                                }}
                                                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                                            >
                                                Aprobar
                                            </button>
                                        </div>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Motivo de rechazo"
                                                className="border rounded px-2 py-1 flex-1"
                                                id={`motivo-${evento._id}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const motivo = (document.getElementById(`motivo-${evento._id}`) as HTMLInputElement)?.value;
                                                    handleRechazar(evento._id, motivo || 'No especificado');
                                                }}
                                                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'agenda' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">
                            Agenda de {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                            >
                                ← Anterior
                            </button>
                            <button
                                onClick={() => changeMonth(1)}
                                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid gap-4">
                        {agendaMensual.length === 0 ? (
                            <p className="text-gray-500">No hay eventos programados para este mes</p>
                        ) : (
                            agendaMensual.map((evento) => (
                                <div key={evento._id} className="border rounded-lg p-4 bg-white shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-600">{evento.tipo}</h3>
                                            <p><strong>Fecha:</strong> {formatFecha(evento.fecha)}</p>
                                            <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                                            <p><strong>Cliente:</strong> {evento.usuario.name}</p>
                                            <p><strong>Invitados:</strong> {evento.numInvitados}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            evento.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                                            evento.estado === 'pagado' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {evento.estado.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}