import api_url from "../administrador/api";

// Crear un nuevo stock
export const createDetalleCarrito = async (idUsuario,idCarrito, carritoData) => {
    return await api_url.post(`/carrito/${idUsuario}/${idCarrito}`,carritoData);
};

// Obtener todos los stocks
export const getDetalleCarrito = async (idUsuario,idCarrito) => {
    return await api_url.get(`/carrito/${idUsuario}/${idCarrito}`);
};

