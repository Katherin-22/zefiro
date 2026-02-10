import axios from "axios";

const api_url = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
    }
});

api_url.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // O donde guardes tu JWT
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default api_url;