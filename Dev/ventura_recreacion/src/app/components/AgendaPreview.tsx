// components/AgendaPreview.tsx
"use client";
import { useEffect, useState } from 'react';

interface Evento {
    fecha: string;
    tipo: string;
    ubicacion: string;
}

export default function AgendaPreview() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/eventos`);
                const data = await response.json();
                setEventos(data);
            } catch (error) {
                console.error('Error fetching eventos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEventos();
    }, []);

    if (loading) return <div>Cargando eventos...</div>;

    return (
        <section className="section-preview">
            <h2 className="preview-title">Próximos Eventos</h2>
            <div className="preview-list">
                {eventos.map((evento, index) => (
                    <div key={index} className="evento-preview">
                        <div className="evento-fecha">{evento.fecha}</div>
                        <h3 className="evento-tipo">{evento.tipo}</h3>
                        <p className="evento-ubicacion">{evento.ubicacion}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}