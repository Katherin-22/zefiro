import api_url from "../administrador/api";

export const createPaymentIntent =  (idUsuario, payload) => {
    return  api_url.post(`/api/payments/create/${idUsuario}`, payload);
};


