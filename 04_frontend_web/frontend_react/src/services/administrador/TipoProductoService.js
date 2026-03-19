import api_url from "./api";

// Obtener todos los TipoProducto
export const getTipoProductos = async () => {
    return await api_url.get("/publico/tipo_productos");
};

// Obtener un TipoProducto por ID
export const getTipoProductoById  = async (idTipoProducto) => {
    return await api_url.get(`/publico/tipo_producto/${idTipoProducto}`);
};