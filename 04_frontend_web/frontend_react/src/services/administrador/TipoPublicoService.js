import api_url from "./api";

// Obtener todos los TipoPublico
export const getTipoPublicos = async () => {
    return await api_url.get("/publico/tipo_publicos");
};

// Obtener un TipoPublico por ID
export const getTipoPublicoById  = async (idPublico) => {
    return await api_url.get(`/publico/tipo_publico/${idPublico}`);
};