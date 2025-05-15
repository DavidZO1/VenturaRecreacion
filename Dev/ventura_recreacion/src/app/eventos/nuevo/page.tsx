"use client";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createEvento } from '../../api/eventos-api';
import { useRouter } from 'next/navigation';

export default function NewEventPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        fecha: '',
        tipo: '',
        ubicacion: '',
        descripcion: '',
        numInvitados: 0,
        serviciosAdicionales: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'numInvitados' ? parseInt(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('Debes iniciar sesión para crear un evento');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Convertir la fecha del formulario a un objeto Date
            const eventoData = {
                ...formData,
                fecha: new Date(formData.fecha).toISOString(),
                // No necesitamos enviar el usuario porque el backend lo obtiene del token
            };
            
            await createEvento(eventoData, user.token);
            router.push('/mis-eventos'); // Redirigir a la página de eventos del usuario
        } catch (err) {
            setError(err.message || 'Error al crear el evento. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Crear Nuevo Evento</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Evento
                    </label>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
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
                
                <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha del Evento
                    </label>
                    <input
                        type="datetime-local"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación
                    </label>
                    <input
                        type="text"
                        id="ubicacion"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        placeholder="Dirección del evento"
                        className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="numInvitados" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Invitados
                    </label>
                    <input
                        type="number"
                        id="numInvitados"
                        name="numInvitados"
                        value={formData.numInvitados}
                        onChange={handleChange}
                        min="0"
                        className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                
                <div>
                    <label htmlFor="serviciosAdicionales" className="block text-sm font-medium text-gray-700 mb-1">
                        Servicios Adicionales
                    </label>
                    <input
                        type="text"
                        id="serviciosAdicionales"
                        name="serviciosAdicionales"
                        value={formData.serviciosAdicionales}
                        onChange={handleChange}
                        placeholder="Catering, música, decoración, etc."
                        className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Detalles adicionales sobre el evento"
                        rows={4}
                        className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Creando...' : 'Crear Evento'}
                </button>
            </form>
        </div>
    );
}