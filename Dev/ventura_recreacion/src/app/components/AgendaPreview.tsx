// components/AgendaPreview.tsx
"use client";
export default function AgendaPreview() {
    const proximosEventos = [
      {
        fecha: "15 Marzo 2025",
        tipo: "Cumpleaños Infantil",
        ubicacion: "Salón de Eventos Luna"
      },
      {
        fecha: "20 Marzo 2025",
        tipo: "Conferencia Empresarial",
        ubicacion: "Centro de Convenciones"
      }
    ];
  
    return (
      <section className="section-preview">
        <h2 className="preview-title">Próximos Eventos</h2>
        <div className="preview-list">
          {proximosEventos.map((evento, index) => (
            <div key={index} className="evento-preview">
              <div className="evento-fecha">{evento.fecha}</div>
              <h3 className="evento-tipo">{evento.tipo}</h3>
              <p className="evento-ubicacion">{evento.ubicacion}</p>
            </div>
          ))}
        </div>
        <a href="/agenda" className="ver-todos">Ver agenda completa →</a>
        <style jsx>{`
          .section-preview {
            padding: 4rem 0;
            background: white;
          }
          
          .preview-list {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          .evento-preview {
            background: #fff;
            border-left: 4px solid #27ae60;
            padding: 1rem;
            margin: 1rem 0;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          
          .evento-fecha {
            color: #666;
            font-size: 0.9rem;
          }
          
          .evento-tipo {
            color: #2c3e50;
            margin: 0.5rem 0;
          }
          
          .evento-ubicacion {
            color: #666;
            font-size: 0.9rem;
          }
          
          .ver-todos {
            display: block;
            text-align: center;
            margin-top: 2rem;
            color: #27ae60;
            text-decoration: none;
            font-weight: 500;
          }
          
          .ver-todos:hover {
            text-decoration: underline;
          }
        `}</style>
      </section>
    );
  }