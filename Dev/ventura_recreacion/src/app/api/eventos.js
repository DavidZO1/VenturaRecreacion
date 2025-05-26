// src/app/api/eventos.js
export const createEvento = async (eventoData, token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const userId = getUser IdFromToken(token); // Función para obtener el ID del usuario desde el token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...eventoData, userId, status: 'pendiente de aprobación', paymentMethod: eventoData.paymentMethod })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear evento');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating evento:', error);
    throw error;
  }
};
