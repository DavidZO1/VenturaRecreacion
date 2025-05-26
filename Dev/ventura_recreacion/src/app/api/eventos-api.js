// src/app/api/eventos-api.js

// Obtener todos los eventos (solo para admins) o eventos públicos (para usuarios)
export const fetchEventos = async (token) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos`, {
            method: 'GET',
            headers
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener eventos');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching eventos:', error);
        throw error;
    }
};

// Obtener eventos del usuario autenticado
export const fetchMisEventos = async (token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/mis-eventos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener eventos');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching mis eventos:', error);
        throw error;
    }
};

// Obtener eventos pendientes (solo para admins)
export const fetchEventosPendientes = async (token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/pendientes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener eventos pendientes');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching eventos pendientes:', error);
        throw error;
    }
};

// Obtener agenda por mes (solo para admins)
export const fetchAgendaMensual = async (year, month, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/agenda/${year}/${month}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener agenda mensual');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching agenda mensual:', error);
        throw error;
    }
};

// Obtener un evento específico
export const fetchEvento = async (id, token) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}`, {
            method: 'GET',
            headers
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener evento');
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error fetching evento ${id}:`, error);
        throw error;
    }
};

// Crear un nuevo evento
export const createEvento = async (eventoData, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventoData)
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

// Aprobar un evento (solo para admins)
export const aprobarEvento = async (id, precio, notas, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}/aprobar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ precio, notas }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al aprobar evento');
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error aprobando evento ${id}:`, error);
        throw error;
    }
};

// Rechazar un evento (solo para admins)
export const rechazarEvento = async (id, motivoRechazo, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}/rechazar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ motivoRechazo }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al rechazar evento');
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error rechazando evento ${id}:`, error);
        throw error;
    }
};

// Marcar evento como pagado (solo para admins)
export const marcarEventoPagado = async (id, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}/marcar-pagado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al marcar evento como pagado');
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error marcando evento ${id} como pagado:`, error);
        throw error;
    }
};

// Actualizar un evento
export const updateEvento = async (id, eventoData, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventoData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar evento');
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error updating evento ${id}:`, error);
        throw error;
    }
};

// Eliminar un evento
export const deleteEvento = async (id, token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar evento');
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error deleting evento ${id}:`, error);
        throw error;
    }
};