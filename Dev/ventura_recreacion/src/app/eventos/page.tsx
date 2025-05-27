"use client";
import { useAuth } from '../context/AuthContext';
import { fetchMisEventos, deleteEvento } from '../api/eventos-api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './MisEventosPage.css';

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

  if (loading) return <div className="p-4">Cargando mis eventos...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="mis-eventos-container">
      <div className="mis-eventos-header">
        <h1 className="mis-eventos-title">Mis Eventos</h1>
        <Link href="/eventos/nuevo" className="crear-evento-button">
          + Crear Evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No tienes eventos creados</p>
          <Link href="/eventos/nuevo" className="crear-evento-button">
            Crear tu primer evento
          </Link>
        </div>
      ) : (
        <div className="eventos-container">
          {eventos.map((evento) => (
            <div key={evento._id} className="evento-card">
              <div className="evento-header">
                <h2>{evento.tipo}</h2>
                <span className={`estado-badge estado-${evento.estado}`}>
                  {evento.estado.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Fecha:</strong>{' '}
                    {new Date(evento.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
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

              <div className="evento-footer">
                {evento.estado === 'pendiente' && (
                  <>
                    
                    <button
                      onClick={() => handleDelete(evento._id)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {evento.estado === 'aprobado' && (
                  <div className="aprobado-actions">
                    <span className="text-green-600">
                      Aprobado - Precio: ${evento.precio}
                    </span>
                    <Link
                      href={`/pagos?eventoId=${evento._id}&monto=${evento.precio}`}
                      className="btn-pagar"
                    >
                      Realizar Pago
                    </Link>
                  </div>
                )}
                {evento.estado === 'pagado' && (
                  <span className="text-blue-600 text-sm">
                    Evento confirmado y pagado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}