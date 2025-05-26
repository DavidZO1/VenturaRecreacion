"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchEvento, updateEvento } from '../../api/eventos-api';
import '../nuevo/NewEventPage.css';

interface FormData {
    fecha: string;
    tipo: string;
    ubicacion: string;
    descripcion: string;
    numInvitados: number;
    serviciosAdicionales: string;
}

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditEventPage({ params }: PageProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState<FormData>({
        fecha: '',
        tipo: '',
        ubicacion: '',
        descripcion: '',
        numInvitados: 0,
        serviciosAdicionales: ''
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadEvento();
    }, [user, params.id]);

    const loadEvento = async () => {
        try {
            const evento = await fetchEvento(params.id, user!.token);
            
            // Verificar que el usuario puede editar este evento
            if (evento.usuario._id !== user!.userId && user!.role !== 'admin') {
                setError('No tienes permisos para editar este evento');
                return;
            }
            
            // Verificar que el evento se puede editar
            if (evento.estado !== 'pendiente') {
                setError('Solo se pueden editar eventos pendientes');
                return;
            }
            
            // Formatear la fecha para el input datetime-local
            const fechaFormatted = new Date(evento.fecha).toISOString().slice(0, 16);
            
            setFormData({
                fecha: fechaFormatted,
                tipo: evento.tipo,
                ubicacion: evento.ubicacion,
                descripcion: evento.descripcion || '',
                numInvitados: evento.numInvitados || 0,
                serviciosAdicionales: evento.serviciosAdicionales || ''
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar el evento');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'numInvitados' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!user) {
            setError('Debes iniciar sesión para editar un evento');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            const eventoData = {
                ...formData,
                fecha: new Date(formData.fecha).toISOString(),
            };
            
            await updateEvento(params.id, eventoData, user.token);
            router.push('/eventos');
        } catch (err: unknown) {
            let errorMessage = 'Error al actualizar el evento. Inténtalo de nuevo.';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/eventos');
    };

    if (loading) return <div className="new-event-container"><div className="new-event-card"><div className="new-event-header"><h1>Cargando evento...</h1></div></div></div>;

    if (error && !formData.tipo) {
        return (
            <div className="new-event-container">
                <div className="new-event-card">
                    <div className="new-event-header">
                        <h1>❌ Error</h1>
                    </div>
                    <div className="new-event-form">
                        <div className="new-event-error">{error}</div>
                        <button onClick={handleCancel} className="new-event-button">
                            Volver a Mis Eventos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="new-event-container">
            <div className="new-event-card">
                <div className="new-event-header">
                    <h1>✏️ Editar Evento</h1>
                    <p>Modifica los datos del evento</p>
                </div>

                <div className="new-event-form">
                    {error && <div className="new-event-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="tipo">Tipo de Evento</label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un tipo</option>
                                <option value="Infantil">Infantil</option>
                                <option value="Empresarial">Empresarial</option>
                                <option value="Boda">Boda</option>
                                <option value="Cumpleaños">Cumpleaños</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="fecha">Fecha del Evento</label>
                            <input
                                type="datetime-local"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="ubicacion">Ubicación</label>
                            <input
                                type="text"
                                id="ubicacion"
                                name="ubicacion"
                                value={formData.ubicacion}
                                onChange={handleChange}
                                required
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="numInvitados">Número de Invitados</label>
                            <input
                                type="number"
                                id="numInvitados"
                                name="numInvitados"
                                value={formData.numInvitados}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="serviciosAdicionales">Servicios Adicionales</label>
                            <input
                                type="text"
                                id="serviciosAdicionales"
                                name="serviciosAdicionales"
                                value={formData.serviciosAdicionales}
                                onChange={handleChange}
                                placeholder="Catering, música, decoración..."
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                rows={4}
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Detalles importantes del evento"
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="new-event-button"
                                style={{ backgroundColor: '#6b7280', flex: 1 }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="new-event-button"
                                style={{ flex: 2 }}
                            >
                                {isLoading ? 'Guardando Cambios...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}