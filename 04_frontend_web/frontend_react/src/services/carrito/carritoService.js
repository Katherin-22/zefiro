import api_url from "../administrador/api";

// Crear un nuevo stock
export const createCarrito = async (idUsuario, carritoData) => {
    return await api_url.post(`/carrito/${idUsuario}`,carritoData);
};

// Obtener todos los stocks
export const getCarrito = async (idUsuario) => {
    return await api_url.get(`/carrito/${idUsuario}`);
};

