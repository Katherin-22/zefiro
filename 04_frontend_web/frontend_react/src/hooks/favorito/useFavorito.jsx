// hooks/favorito/useFavorito.jsx
import { useState, useCallback } from 'react';
import axios from 'axios';
import api_url from '../../services/administrador/api';

// Crear instancia de axios aquí mismo
const API_URL = `${api_url}/api/favoritos`;

const favoritosApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token JWT
favoritosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
favoritosApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/loginpage';
    }
    return Promise.reject(error);
  }
);

export const useFavoritos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. AGREGAR PRODUCTO A FAVORITOS
  const agregarFavorito = useCallback(async (idUsuario, requestData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoritosApi.post(`/usuario/${idUsuario}/agregar`, requestData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al agregar a favoritos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. ELIMINAR PRODUCTO DE FAVORITOS
  const eliminarFavorito = useCallback(async (idUsuario, idProducto) => {
    try {
      setLoading(true);
      setError(null);
      await favoritosApi.delete(`/usuario/${idUsuario}/producto/${idProducto}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar de favoritos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. OBTENER TODOS LOS FAVORITOS DE UN USUARIO
  const obtenerFavoritosUsuario = useCallback(async (idUsuario) => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoritosApi.get(`/usuario/${idUsuario}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener favoritos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. OBTENER PRODUCTOS CON DETALLES
  const obtenerProductosFavoritos = useCallback(async (idUsuario) => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoritosApi.get(`/usuario/${idUsuario}/productos`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener productos favoritos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. VERIFICAR SI UN PRODUCTO ESTÁ EN FAVORITOS
  const verificarProductoEnFavoritos = useCallback(async (idUsuario, idProducto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoritosApi.get(`/usuario/${idUsuario}/verificar/${idProducto}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al verificar favorito';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 6. CONTAR FAVORITOS DE UN USUARIO
  const contarFavoritosUsuario = useCallback(async (idUsuario) => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoritosApi.get(`/usuario/${idUsuario}/contar`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al contar favoritos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 7. ELIMINAR TODOS LOS FAVORITOS
  const eliminarTodosFavoritos = useCallback(async (idUsuario) => {
    try {
      setLoading(true);
      setError(null);
      await favoritosApi.delete(`/usuario/${idUsuario}/todos`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar todos los favoritos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 8. LIMPIAR ERRORES
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estados
    loading,
    error,
    
    // Funciones CRUD
    agregarFavorito,
    eliminarFavorito,
    obtenerFavoritosUsuario,
    obtenerProductosFavoritos,
    verificarProductoEnFavoritos,
    contarFavoritosUsuario,
    eliminarTodosFavoritos,
    
    // Utilidades
    limpiarError,
  };
};