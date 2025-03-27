// app/servicios/page.tsx
import "./ServiciosPage.css";

export default function Servicios() {
  const servicios = [
    {
      nombre: "Eventos Infantiles",
      descripcion: "Paquetes completos con animadores profesionales, juegos y seguridad",
      precio: "$500.000"
    },
    {
      nombre: "Eventos Corporativos",
      descripcion: "Team building y actividades de integración empresarial",
      precio: "$1.200.000"
    },
    {
      nombre: "Bodas",
      descripcion: "Organización completa de ceremonia y recepción",
      precio: "$2.500.000"
    }
  ];

  return (
    <div className="servicios-page">
      <h1>Nuestros Servicios</h1>
      <div className="servicios-grid">
        {servicios.map((servicio, index) => (
          <div key={index} className="servicio-card">
            <h3>{servicio.nombre}</h3>
            <p>{servicio.descripcion}</p>
            <div className="servicio-precio">{servicio.precio}</div>
            <button className="boton-primario">Contratar</button>
          </div>
        ))}
      </div>
    </div>
  );
}