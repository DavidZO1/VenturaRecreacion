// app/agenda/page.tsx
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
    <div className="container">
      <h1 className="section-title">Agenda de Eventos</h1>
      <div className="calendar">
        {eventos.map((evento, index) => (
          <div key={index} className="card event-card">
            <div className="event-date">{evento.fecha}</div>
            <div className="event-time">{evento.hora}</div>
            <h3>{evento.tipo}</h3>
            <p>{evento.ubicacion}</p>
          </div>
        ))}
      </div>
      <style jsx>{`
        .calendar {
          display: grid;
          gap: 1.5rem;
        }
        
        .event-date {
          font-weight: 600;
          color: #27ae60;
        }
        
        .event-time {
          color: #666;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}