"use client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import './PerfilPage.css';

export default function PerfilPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="perfil-page">Cargando perfil...</div>;
  }

  return (
    <div className="perfil-page">
      <div className="perfil-container">
        <h1 className="perfil-titulo">Mi Perfil</h1>

        <div className="perfil-item">
          <label className="perfil-label">Nombre</label>
          <div className="perfil-dato">{user.name}</div>
        </div>

        <div className="perfil-item">
          <label className="perfil-label">Email</label>
          <div className="perfil-dato">{user.email}</div>
        </div>

        <div className="perfil-item">
          <label className="perfil-label">Miembro desde</label>
          <div className="perfil-dato">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="perfil-botones">
          <button className="perfil-btn logout" onClick={logout}>
            Cerrar Sesión
          </button>
          <button
            className="perfil-btn eventos"
            onClick={() => router.push('/eventos')}
          >
            Ver Mis Eventos
          </button>
        </div>
      </div>
    </div>
  );
}
