// services/administrador/pedidos.js
import api_url from "./api";

export const getPedido = async () => {
    const authToken = localStorage.getItem('authToken'); 
    // ✅ Cambiar a /api/pedidos en lugar de /api/pedidos/detalles
    return await api_url.get("/api/pedidos", {
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

export const actualizarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
        console.log('Enviando PATCH a:', `/api/pedidos/${idPedido}/estado?estado=${nuevoEstado}`);
        
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