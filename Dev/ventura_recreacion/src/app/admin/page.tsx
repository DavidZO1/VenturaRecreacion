"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEventosPendientes, fetchAgendaMensual, aprobarEvento, rechazarEvento } from '../api/eventos-api';
import './AdminPanel.css';

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
        fetchAgendaMensual(currentDate.getFullYear(), currentDate.getMonth() + 1, user!.token)
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

  if (user?.role !== 'admin') return <div className="admin-panel">Acceso denegado. Solo administradores.</div>;
  if (loading) return <div className="admin-panel">Cargando...</div>;

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>

      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`admin-tab ${activeTab === 'pendientes' ? 'active' : ''}`}
        >
          Eventos Pendientes ({eventosPendientes.length})
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={`admin-tab ${activeTab === 'agenda' ? 'active' : ''}`}
        >
          Agenda Mensual
        </button>
      </div>

      {activeTab === 'pendientes' && (
        <div>
          <h2>Eventos Pendientes de Aprobación</h2>
          {eventosPendientes.length === 0 ? (
            <p className="text-muted">No hay eventos pendientes</p>
          ) : (
            eventosPendientes.map((evento) => (
              <div key={evento._id} className="evento-card">
                <div className="evento-info">
                  <h3>{evento.tipo}</h3>
                  <p><strong>Fecha:</strong> {formatFecha(evento.fecha)}</p>
                  <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                  <p><strong>Invitados:</strong> {evento.numInvitados}</p>
                  <p><strong>Cliente:</strong> {evento.usuario.name} ({evento.usuario.email})</p>
                  {evento.descripcion && <p><strong>Descripción:</strong> {evento.descripcion}</p>}
                </div>
                <div className="controles">
                  <div className="controles">
                    <input
                      type="number"
                      placeholder="Precio"
                      className="input"
                      id={`precio-${evento._id}`}
                    />
                    <button
                      onClick={() => {
                        const precio = (document.getElementById(`precio-${evento._id}`) as HTMLInputElement)?.value;
                        handleAprobar(evento._id, parseFloat(precio) || 0);
                      }}
                      className="btn btn-green"
                    >
                      Aprobar
                    </button>
                  </div>
                  <div className="controles">
                    <input
                      type="text"
                      placeholder="Motivo de rechazo"
                      className="input"
                      id={`motivo-${evento._id}`}
                    />
                    <button
                      onClick={() => {
                        const motivo = (document.getElementById(`motivo-${evento._id}`) as HTMLInputElement)?.value;
                        handleRechazar(evento._id, motivo || 'No especificado');
                      }}
                      className="btn btn-red"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'agenda' && (
        <div>
          <div className="agenda-header">
            <h2>Agenda de {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
            <div className="controles">
              <button onClick={() => changeMonth(-1)} className="btn">← Anterior</button>
              <button onClick={() => changeMonth(1)} className="btn">Siguiente →</button>
            </div>
          </div>

          <div>
            {agendaMensual.length === 0 ? (
              <p className="text-muted">No hay eventos programados para este mes</p>
            ) : (
              agendaMensual.map((evento) => (
                <div key={evento._id} className="evento-card">
                  <div className="evento-info">
                    <h3>{evento.tipo}</h3>
                    <p><strong>Fecha:</strong> {formatFecha(evento.fecha)}</p>
                    <p><strong>Ubicación:</strong> {evento.ubicacion}</p>
                    <p><strong>Cliente:</strong> {evento.usuario.name}</p>
                    <p><strong>Invitados:</strong> {evento.numInvitados}</p>
                  </div>
                  <span className={`evento-status ${
                    evento.estado === 'aprobado' ? 'aprobado' :
                    evento.estado === 'pagado' ? 'pagado' : 'otro'
                  }`}>
                    {evento.estado.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
