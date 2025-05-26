"use client";
import { useState } from 'react';
import './NewEventPage.css';
import { useAuth } from '../../context/AuthContext';
import { createEvento } from '../../api/eventos-api';
import { useRouter } from 'next/navigation';

interface FormData {
    fecha: string;
    tipo: string;
    ubicacion: string;
    descripcion: string;
    numInvitados: number;
    serviciosAdicionales: string;
}

export default function NewEventPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState<FormData>({
        fecha: '',
        tipo: '',
        ubicacion: '',
        descripcion: '',
        numInvitados: 0,
        serviciosAdicionales: ''
    });

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
            setError('Debes iniciar sesión para crear un evento');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            const eventoData = {
                ...formData,
                fecha: new Date(formData.fecha).toISOString(),
            };
            
            await createEvento(eventoData, user.token);
            router.push('/eventos');
        } catch (err: unknown) {
            let errorMessage = 'Error al crear el evento. Inténtalo de nuevo.';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
  <div className="new-event-container">
    <div className="new-event-card">
      <div className="new-event-header">
        <h1>🎉 Crear Nuevo Evento</h1>
        <p>Completa los datos del evento</p>
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

          <button
            type="submit"
            disabled={isLoading}
            className="new-event-button"
          >
            {isLoading ? 'Creando Evento...' : 'Crear Evento'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

}