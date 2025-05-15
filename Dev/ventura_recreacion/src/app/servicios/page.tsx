// app/servicios/page.tsx
"use client";
import "./ServiciosPage.css";
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Servicios() {
  const router = useRouter();
  const { user } = useAuth();

  const servicios = [
    {
      nombre: "Eventos Infantiles",
      tipo: "Infantil",
      descripcion: "Paquetes completos con animadores profesionales, juegos y seguridad",
      precio: 500000
    },
    {
      nombre: "Eventos Corporativos",
      tipo: "Empresarial",
      descripcion: "Team building y actividades de integración empresarial",
      precio: 1200000
    },
    {
      nombre: "Bodas",
      tipo: "Boda",
      descripcion: "Organización completa de ceremonia y recepción",
      precio: 2500000
    }
  ];

  const handleContratar = (servicio: any) => {
    if (!user) {
      alert("Debes iniciar sesión para contratar servicios");
      router.push('/login');
      return;
    }
    
    localStorage.setItem('servicioContratado', JSON.stringify(servicio));
    router.push(`/pagos?amount=${servicio.precio}`);
  };

  return (
    <div className="servicios-page">
      <h1>Nuestros Servicios</h1>
      <div className="servicios-grid">
        {servicios.map((servicio, index) => (
          <div key={index} className="servicio-card">
            <h3>{servicio.nombre}</h3>
            <p>{servicio.descripcion}</p>
            <div className="servicio-precio">${servicio.precio.toLocaleString()}</div>
            <button 
              className="boton-primario" 
              onClick={() => handleContratar(servicio)}
            >
              Contratar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}