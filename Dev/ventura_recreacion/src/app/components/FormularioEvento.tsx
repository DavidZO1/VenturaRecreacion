// src/app/components/FormularioEvento.tsx
"use client";

import { useState } from "react";

export default function FormularioEvento() {
  const [formData, setFormData] = useState({
    tipoEvento: "",
    numInvitados: "",
    fecha: "",
    serviciosAdicionales: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos del formulario:", formData);
    alert("¡Formulario enviado con éxito!");
  };

  return (
    <section id="formulario" className="p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Personaliza tu Evento</h2>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white shadow-md p-6 rounded">
        <div className="mb-4">
          <label htmlFor="tipoEvento" className="block mb-1 font-semibold">
            Tipo de Evento
          </label>
          <select
            id="tipoEvento"
            name="tipoEvento"
            className="w-full border border-gray-300 p-2 rounded"
            value={formData.tipoEvento}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un tipo de evento</option>
            <option value="infantil">Infantil</option>
            <option value="empresarial">Empresarial</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="numInvitados" className="block mb-1 font-semibold">
            Número de Invitados
          </label>
          <input
            type="number"
            id="numInvitados"
            name="numInvitados"
            className="w-full border border-gray-300 p-2 rounded"
            value={formData.numInvitados}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fecha" className="block mb-1 font-semibold">
            Fecha del Evento
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            className="w-full border border-gray-300 p-2 rounded"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="serviciosAdicionales" className="block mb-1 font-semibold">
            Servicios Adicionales
          </label>
          <input
            type="text"
            id="serviciosAdicionales"
            name="serviciosAdicionales"
            placeholder="Payasos, música en vivo, etc."
            className="w-full border border-gray-300 p-2 rounded"
            value={formData.serviciosAdicionales}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
          Enviar
        </button>
      </form>
    </section>
  );
}
