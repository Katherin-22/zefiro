import api_url from "../administrador/api";

export const createPaymentIntent = async (payload) => {
    return await api_url.post("/api/payments/create", payload);
};

