import api_url from "./api";


export const getPedido = async () => {
    const authToken = localStorage.getItem('authToken'); 
    return await api_url.get("/api/pedidos/detalles", {
        headers: {
            'Authorization': `Bearer ${authToken}`  
        }
    });
};


export const obtenerPedidosPorUsuario = async (idUsuario) => {
    return await api_url.get(`/api/pedidos/usuario/${idUsuario}`) 
};

export const buscarPedidoPorId = async (idPedido) => {
    return await api_url.get(`/api/pedidos/buscar/${idPedido}`)  
};

// Función para obtener pedidos por rango de fechas
export const obtenerPedidosPorRangoFechas = async (fechaInicio, fechaFin) => {
    try {
        // Construir la URL con los parámetros
        const url = api_url.get(`/api/pedidos/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        
        // Hacer la petición
        const response = await fetch(url);
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        // Convertir a JSON
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error al obtener pedidos por rango de fechas:', error);
        throw error;
    }
};

export const actualizarEstadoPedido = async (idPedido) => {
    return await api_url.get(`/api/pedidos/${idPedido}/estado`)  
};

export const actualizarEstadoPedidos = async (idPedido) => {
    return await api_url.get(`/api/pedidos/${idPedido}/estado`)  
};

