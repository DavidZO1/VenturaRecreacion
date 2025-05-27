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
    <>
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

      <section className="about-us">
  <h2>Sobre Nosotros</h2>

  {/* Misión */}
  <div className="about-block">
    <div className="text">
      <h3>Misión</h3>
      <p>Nuestra misión es brindar experiencias inolvidables a través de eventos recreativos únicos y personalizados, promoviendo la alegría, el entretenimiento y la unión entre las personas.</p>
    </div>
    <img src="/mision.jpg" alt="Misión" className="about-image" />
  </div>

  {/* Visión */}
  <div className="about-block vision-block">
    <img src="/vision.jpg" alt="Visión" className="about-image" />
    <div className="text">
      <h3>Visión</h3>
      <p>Convertirnos en la empresa líder en organización de eventos recreativos en la región, destacando por nuestra creatividad, profesionalismo y compromiso con la excelencia.</p>
    </div>
  </div>
</section>


    </>
  );
}
