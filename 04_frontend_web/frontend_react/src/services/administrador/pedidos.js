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

export const obtenerPedidosPorRangoFechas = async (fechaInicio, fechaFin) => {
    try {
        const response = await api_url.get(`/api/pedidos/rango-fechas`, {
            params: { fechaInicio, fechaFin }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener pedidos por rango de fechas:', error);
        throw error;
    }
};

// ✅ SOLO ESTA FUNCIÓN ESTÁ CORREGIDA
export const actualizarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
        console.log('Enviando PATCH a:', `/api/pedidos/${idPedido}/estado?estado=${nuevoEstado}`);
        
        // Usar api_url correctamente (sin template strings en la instancia)
        const response = await api_url.patch(
            `/api/pedidos/${idPedido}/estado`,
            null,
            {
                params: { estado: nuevoEstado }
            }
        );
        
        return response;
    } catch (error) {
        console.error('Error en actualizarEstadoPedido:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

// ❌ Esta función está mal y deberías eliminarla o comentarla
// export const actualizarEstadoPedidos = async (idPedido) => {
//     return await api_url.get(`/api/pedidos/${idPedido}/estado`)  
// };