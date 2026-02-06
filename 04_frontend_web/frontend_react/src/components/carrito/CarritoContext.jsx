import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// ==============================
// CONFIG
// ==============================
const LOCAL_STORAGE_KEY = "Zéfiro_cart";

const api_url = axios.create({
    baseURL: "http://localhost:8080/api/carrito",
    withCredentials: true
});


api_url.interceptors.request.use(
    (config) => {
        const tokenRaw = localStorage.getItem("authToken"); 
        const token = tokenRaw ? tokenRaw.replace(/"/g, "") : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==============================
// CONTEXT
// ==============================
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Función auxiliar para obtener el carrito local (solo idStock/cantidad)
const getLocalCart = () => {
    try {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        // Aseguramos que sea un array de objetos con idStock y cantidad
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error("Error al cargar carrito desde localStorage:", e);
        return [];
    }
};

// Función auxiliar para guardar el carrito local (solo idStock/cantidad)
const saveLocalCart = (items) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
    }
}


// ==============================
// PROVIDER
// ==============================
export const CartProvider = ({ children }) => {
    // 🔐 OBTENER DATOS DE AUTENTICACIÓN
    const { user, isLoading: isAuthLoading } = useAuth();
    const userId = user?.id || user?.idUsuario;
    const isAuthenticated = !!userId;

    // 🛒 ESTADOS
    // 🌟 REVERTIDO: Cargamos la data mínima del invitado al inicio
    const [cartItems, setCartItems] = useState(getLocalCart);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cálculo correcto del total de UNIDADES (usando la data del servidor/local)
    const totalItemsCount = useMemo(() => cartItems.reduce((sum, item) => sum + (item.cantidad ?? 0), 0), [cartItems]);


    // ==============================
    // FETCH CARRITO (usa useCallback)
    // ==============================
    const fetchCartItems = useCallback(async () => {
        // Si no está autenticado, simplemente usamos el estado local ya cargado.
        if (!isAuthenticated) {
            setCartItems(getLocalCart());
            return;
        }

        setLoading(true);
        try {
            const response = await api_url.get(`/${userId}`);
            // El backend devuelve los DetalleCarrito con toda la data anidada (JOIN FETCH)

            console.log("Estructura completa del carrito (Backend):", response.data);

            const dataServidor = response.data.detalles ||  [];

            setCartItems(dataServidor); // Asumo que el endpoint devuelve un objeto Carrito con una propiedad 'detalles'
            setError(null);
        } catch (err) {
            if (err.response?.status !== 404) {
                setError("Error al cargar el carrito.");
            }
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [userId, isAuthenticated]);

    // ==============================
    // SINCRONIZACIÓN DE CARRITO LOCAL AL BACKEND (Función clave)
    // ==============================
    const syncLocalCartToBackend = useCallback(async (localCart) => {
        if (!userId || localCart.length === 0) return true;

        setLoading(true);
        try {
            // Transformar el array local al formato que espera el backend: [{ idStock, cantidad }]
            const itemsToSync = localCart.map(item => ({
                idStock: item.idStock,
                cantidad: item.cantidad
            }));

            // Llama al endpoint de sincronización
            const response = await api_url.post(`/sincronizar/${userId}`, itemsToSync);

            localStorage.removeItem(LOCAL_STORAGE_KEY);

            // Actualizar el estado con la respuesta del servidor (carrito mergeado y completo)
            setCartItems(response.data.detalles || []);

            return true;

        } catch (err) {
            console.error("Error al sincronizar carrito:", err);
            setError("Error al sincronizar el carrito de invitado con la sesión. El carrito del servidor será cargado.");
            fetchCartItems();
            return false;
        } finally {
            setLoading(false);
        }
    }, [userId, fetchCartItems]);


    // ==============================
    // SINCRONIZAR LOGIN / LOGOUT (Efecto principal)
    // ==============================
    useEffect(() => {

        const handleAuthChange = async () => {

            console.log("Estado de Auth:", { isAuthLoading, isAuthenticated, userId });

            if (!isAuthLoading) {
                if (isAuthenticated && userId) {
                    const localCartOnLogin = getLocalCart();
                    console.log("Sincronizando... Items locales:", localCartOnLogin.length);

                    if (localCartOnLogin.length > 0) {
                        // 1. Hay items de invitado. Sincronizar.
                       await syncLocalCartToBackend(localCartOnLogin);
                    } else {
                        // 2. No hay items de invitado. Solo cargar el del servidor.
                       await fetchCartItems();
                    }
                } else {
                    // 3. Deslogueado: Asegurar que el estado muestre el carrito local.
                    setCartItems(getLocalCart());
                }
            }

        };
        
        handleAuthChange();
    }, [userId, isAuthenticated, isAuthLoading, fetchCartItems, syncLocalCartToBackend]);

    // ==============================
    // ADD TO CART
    // ==============================
    const addToCart = async (productoData, cantidad) => {

        if (isAuthenticated) {
            // Logueado: Llama al backend (que devuelve la data completa)
            setLoading(true);
            try {
                const response = await api_url.post(`/agregar/${userId}`, { idStock: productoData.idStock , cantidad });
                setCartItems(response.data.detalles || []); // Asumo la estructura de respuesta
                setError(null);
                return true;
            } catch (err) {
                setError("Stock insuficiente o error al agregar.");
                fetchCartItems();
                return false;
            } finally {
                setLoading(false);
            }
        } else {
            // Invitado: Lógica local (solo idStock y cantidad)

            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.idStock === productoData.idStock);
                let newCart;

                if (existingItem) {
                    newCart = prevItems.map(item =>
                        item.idStock === productoData.idStock
                            ? { ...item, cantidad: item.cantidad + cantidad }
                            : item
                    );
                } else {
                    // Agregamos la estructura mínima requerida para SINCRONIZACIÓN
                    newCart = [...prevItems, {
                        idStock: productoData.idStock,
                        cantidad: cantidad,
                        nombreProducto: productoData.nombreProducto, 
                        precio: productoData.precio,
                        imagen: productoData.imagen,
                        stockActual: productoData.stockActual // <--- AGREGADO
                    }];
                }

                // CRÍTICO: Guardamos la nueva lista MÍNIMA en localStorage
                saveLocalCart(newCart);
                return newCart;
            });

            setError(null);
            return true;
        }
    };

    // ==============================
    // UPDATE QUANTITY (PATCH)
    // ==============================
    const updateQuantity = async (id, nuevaCantidad) => {

        if (nuevaCantidad <= 0) return removeFromCart(id);
        
        if (!isAuthenticated) {
            // Invitado: Actualización local usando idStock
            setCartItems(prev => {
                const newCart = prev.map(item => 
                    item.idStock === id ? { ...item, cantidad: nuevaCantidad } : item
                );
                saveLocalCart(newCart);
                return newCart;
            });
            return true;
        }

        // Logueado: Llama al backend
        if (nuevaCantidad <= 0) return removeFromCart(id);

        setLoading(true);
        try {
            const response = await api_url.patch(`/${id}`, { cantidad : nuevaCantidad });
            setCartItems(response.data.detalles || []); 
            return true;
        } catch (err) {
            setError("Error al actualizar cantidad. Posiblemente por stock insuficiente.");
            fetchCartItems();
            return false;
        } finally {
            setLoading(false);
        }
    };

    const increaseQuantity = (id) => {
        const item = cartItems.find(i => (isAuthenticated ? i.idDetalleCarrito : i.idStock) === id);
        if (item) {
            return updateQuantity(id, item.cantidad + 1);
        }
        return false;
    };

    const decreaseQuantity = (id) => {
        const item = cartItems.find(i => (isAuthenticated ? i.idDetalleCarrito : i.idStock) === id);
        if (item) {
            return updateQuantity(id, item.cantidad - 1);
        }
        return false;
    };


    // ==============================
    // REMOVE ITEM (DELETE)
    // ==============================
    const removeFromCart = async (id) => { // 'id' es idDetalleCarrito (logueado) o idStock (invitado)
        if (!isAuthenticated) {
            // Invitado: Lógica local (filtrar por idStock)
            setCartItems(prevItems => {
                const newCart = prevItems.filter(item => item.idStock !== id);
                saveLocalCart(newCart);
                return newCart;
            });
            return true;
        }

        // Logueado: Llama al backend (usando idDetalleCarrito)
        setLoading(true);
        try {
            await api_url.delete(`/eliminar/${userId}/${id}`);
            await fetchCartItems();
            return true;
        } catch {
            setError("Error al eliminar producto.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // CLEAR CART (Vaciar todo)
    // ==============================
    const clearCart = async () => {
        if (!isAuthenticated) {
            // Invitado: Lógica local
            setCartItems([]);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return true;
        }

        // Logueado: Llama al backend
        setLoading(true);
        try {
            await api_url.delete(`/vaciar/${userId}`);
            setCartItems([]);
            return true;
        } catch {
            setError("Error al vaciar el carrito.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // CONTEXT VALUE
    // ==============================
    const value = {
        cart: cartItems,
        totalItems: totalItemsCount,
        loading,
        error,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        fetchCartItems,
        isAuthenticated,
        isAuthLoading,
        userId
    };

    if (isAuthLoading) {
        return <div>Cargando sesión...</div>;
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};