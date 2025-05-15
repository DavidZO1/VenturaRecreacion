// src/app/api/eventos.js
export const fetchEventos = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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

export const fetchEvento = async (id) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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
            body: JSON.stringify(eventoData),
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