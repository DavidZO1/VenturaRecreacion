"use client";
import "./ServiciosPage.css";
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from "react";

export default function Servicios() {
  const router = useRouter();
  const { user } = useAuth();

  const servicios = [
    {
      nombre: "Eventos Infantiles",
      tipo: "Infantil",
      descripcion: "Paquetes completos con animadores profesionales, juegos y seguridad",
      precio: 500000,
      imagenes: [
        "/infantil1.jpg",
        "/infantil2.jpg",
        "/infantil3.jpg"
      ]
    },
    {
      nombre: "Eventos Corporativos",
      tipo: "Empresarial",
      descripcion: "Team building y actividades de integración empresarial",
      precio: 1200000,
      imagenes: [
        "/corporativo1.jpg",
        "/corporativo2.jpg",
        "/corporativo3.jpg"
      ]
    },
    {
      nombre: "Bodas",
      tipo: "Boda",
      descripcion: "Organización completa de ceremonia y recepción",
      precio: 2500000,
      imagenes: [
        "/boda1.jpg",
        "/boda2.jpg",
        "/boda3.jpg"
      ]
    }
  ];

  const [indiceImagen, setIndiceImagen] = useState(Array(servicios.length).fill(0));

  const cambiarImagen = (servicioIndex: number, direccion: number) => {
    setIndiceImagen(prev => {
      const copia = [...prev];
      const total = servicios[servicioIndex].imagenes.length;
      copia[servicioIndex] = (copia[servicioIndex] + direccion + total) % total;
      return copia;
    });
  };

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
            <div className="carousel">
              <img
                src={servicio.imagenes[indiceImagen[index]]}
                alt={servicio.nombre}
                className="carousel-img"
              />
              <button
                className="flecha izquierda"
                onClick={() => cambiarImagen(index, -1)}
              >
                ‹
              </button>
              <button
                className="flecha derecha"
                onClick={() => cambiarImagen(index, 1)}
              >
                ›
              </button>
            </div>
            <h3>{servicio.nombre}</h3>
            <p>{servicio.descripcion}</p>
            <div className="servicio-precio">${servicio.precio.toLocaleString()}</div>
            <button className="boton-primario" onClick={() => handleContratar(servicio)}>
              Contratar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
