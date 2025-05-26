"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEventosPendientes, fetchAgendaMensual, aprobarEvento, rechazarEvento, marcarEventoPagado } from '../api/eventos-api';
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
  serviciosAdicionales?: string;
  createdAt: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [eventosPendientes, setEventosPendientes] = useState<Evento[]>([]);
  const [agendaMensual, setAgendaMensual] = useState<Evento[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user?.token) {
      setError('No hay token de autenticación');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Cargando datos del admin...');
      
      const [pendientes, agenda] = await Promise.all([
        fetchEventosPendientes(user.token).catch(err => {
          console.error('Error fetching pendientes:', err);
          throw err;
        }),
        fetchAgendaMensual(currentDate.getFullYear(), currentDate.getMonth() + 1, user.token).catch(err => {
          console.error('Error fetching agenda:', err);
          throw err;
        })
      ]);
      
      console.log('Eventos pendientes:', pendientes);
      console.log('Agenda mensual:', agenda);
      
      setEventosPendientes(pendientes);
      setAgendaMensual(agenda);
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      setError(`Error al cargar datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: string, precio: number, notas: string = '') => {
    try {
      setError('');
      await aprobarEvento(id, precio, notas, user!.token);
      await loadData(); // Recargar datos
    } catch (error: any) {
      console.error('Error aprobando evento:', error);
      setError(`Error al aprobar evento: ${error.message}`);
    }
  };

  const handleRechazar = async (id: string, motivo: string) => {
    try {
      setError('');
      await rechazarEvento(id, motivo, user!.token);
      await loadData(); // Recargar datos
    } catch (error: any) {
      console.error('Error rechazando evento:', error);
      setError(`Error al rechazar evento: ${error.message}`);
    }
  };

  const handleMarcarPagado = async (id: string) => {
    try {
      setError('');
      await marcarEventoPagado(id, user!.token);
      await loadData(); // Recargar datos
    } catch (error: any) {
      console.error('Error marcando como pagado:', error);
      setError(`Error al marcar como pagado: ${error.message}`);
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
    return <div className="admin-panel">Acceso denegado. Solo administradores.</div>;
  }

  if (loading) {
    return <div className="admin-panel">Cargando panel de administración...</div>;
  }

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>

      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fca5a5', 
          color: '#b91c1c', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem' 
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
          >
            ✕
          </button>
        </div>
      )}

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
          Agenda Mensual ({agendaMensual.length})
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
                  {evento.serviciosAdicionales && <p><strong>Servicios:</strong> {evento.serviciosAdicionales}</p>}
                  <p><strong>Creado:</strong> {formatFecha(evento.createdAt)}</p>
                </div>
                
                <div className="controles">
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="Precio ($)"
                      className="input"
                      id={`precio-${evento._id}`}
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      placeholder="Notas (opcional)"
                      className="input"
                      id={`notas-${evento._id}`}
                    />
                    <button
                      onClick={() => {
                        const precioInput = document.getElementById(`precio-${evento._id}`) as HTMLInputElement;
                        const notasInput = document.getElementById(`notas-${evento._id}`) as HTMLInputElement;
                        const precio = parseFloat(precioInput?.value) || 0;
                        const notas = notasInput?.value || '';
                        handleAprobar(evento._id, precio, notas);
                      }}
                      className="btn btn-green"
                    >
                      ✓ Aprobar
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Motivo de rechazo"
                      className="input"
                      id={`motivo-${evento._id}`}
                    />
                    <button
                      onClick={() => {
                        const motivoInput = document.getElementById(`motivo-${evento._id}`) as HTMLInputElement;
                        const motivo = motivoInput?.value || 'No especificado';
                        if (confirm(`¿Estás seguro de rechazar este evento? Motivo: ${motivo}`)) {
                          handleRechazar(evento._id, motivo);
                        }
                      }}
                      className="btn btn-red"
                    >
                      ✗ Rechazar
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
              <button 
                onClick={() => setCurrentDate(new Date())} 
                className="btn"
                style={{ backgroundColor: '#3b82f6', color: 'white' }}
              >
                Hoy
              </button>
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
                    {evento.precio && <p><strong>Precio:</strong> ${evento.precio}</p>}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`evento-status ${
                      evento.estado === 'aprobado' ? 'aprobado' :
                      evento.estado === 'pagado' ? 'pagado' : 'otro'
                    }`}>
                      {evento.estado.toUpperCase()}
                    </span>
                    
                    {evento.estado === 'aprobado' && (
                      <button
                        onClick={() => {
                          if (confirm('¿Marcar este evento como pagado?')) {
                            handleMarcarPagado(evento._id);
                          }
                        }}
                        className="btn btn-green"
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                      >
                        💳 Marcar Pagado
                      </button>
                    )}
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