// services/administrador/api.js
import axios from "axios";

const api_url = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api_url;