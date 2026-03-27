import api_url from "../administrador/api";

export const createPaymentIntent =  ( payload) => {
    return  api_url.post(`/api/payments/create`, payload);
};


