"use client";
import "./ServicesPreview.css";

export default function ServicesPreview() {
  const servicios = [
    {
      nombre: "Fiestas Infantiles",
      descripcion: "Paquetes completos con animación y juegos seguros",
      precio: "$500.000"
    },
    {
      nombre: "Eventos Corporativos", 
      descripcion: "Actividades de integración empresarial",
      precio: "$1.200.000"
    }
  ];

  return (
    <section className="services-preview">
      <h2>Nuestros Servicios Destacados</h2>
      <div className="services-grid">
        {servicios.map((servicio, index) => (
          <div key={index} className="service-card">
            <h3>{servicio.nombre}</h3>
            <p>{servicio.descripcion}</p>
            <div className="price">{servicio.precio}</div>
            <a href="/servicios" className="service-button">Ver más</a>
          </div>
        ))}
      </div>
    </section>
  );
}