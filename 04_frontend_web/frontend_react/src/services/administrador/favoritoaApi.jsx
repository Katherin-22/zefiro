import api_url from "./api";
import axios from "axios";

const favoritoApi = axios.create({
    baseURL:api_url,
    headers:{
        "Content-Type": 'application/json',
    },
    timeout: 10000, 
});

favoritoApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token){
            config.headers.Authorization = 'Bearer $(token)';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

favoritoApi.interceptors.request.use(
 (Response) => {
    return Response;
 },
 (error) => {
    if (error.Response?.status === 401){
        localStorage.removeItem('token');
        window.location.href = '/loginPage';    
    }

    if (error.Response?.status === 403) {
        console.error('no tienes permisos para esta accion');
 }
 return Promise.reject(error)
 }
);