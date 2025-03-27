// app/agenda/page.tsx
import "./AgendaPage.css";

export default function Agenda() {
  const eventos = [
    {
      fecha: "15 Marzo 2025",
      hora: "16:00",
      tipo: "Evento Infantil",
      ubicacion: "Parque Central"
    },
    {
      fecha: "20 Marzo 2025",
      hora: "19:00",
      tipo: "Boda",
      ubicacion: "Hacienda San José"
    }
  ];

  return (
    <div className="agenda-page">
      <h1>Agenda de Eventos</h1>
      <div className="eventos-container">
        {eventos.map((evento, index) => (
          <div key={index} className="evento-card">
            <div className="evento-header">
              <span className="evento-fecha">{evento.fecha}</span>
              <span className="evento-hora">{evento.hora}</span>
            </div>
            <h3>{evento.tipo}</h3>
            <p className="evento-ubicacion">{evento.ubicacion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}