"use client";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function NewEventPage() {
    const [formData, setFormData] = useState({
        tipo: '',
        fecha: '',
        ubicacion: '',
        descripcion: ''
    });
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...formData,
                usuario: user?._id
            })
        });
        
        if (response.ok) {
            alert('Evento creado!');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Crear Nuevo Evento</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Selecciona un tipo</option>
                    <option value="Boda">Boda</option>
                    <option value="Empresarial">Evento Empresarial</option>
                    <option value="Infantil">Fiesta Infantil</option>
                </select>
                
                <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                />
                
                <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    placeholder="Ubicación"
                    className="w-full p-2 border rounded"
                    required
                />
                
                <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción"
                    className="w-full p-2 border rounded"
                />
                
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                    Crear Evento
                </button>
            </form>
        </div>
    );
}