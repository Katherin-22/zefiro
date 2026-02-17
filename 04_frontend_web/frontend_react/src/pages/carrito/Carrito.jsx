import { useState, useEffect, useRef , useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../components/carrito/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import { getImagenById } from "../../services/administrador/ImagenService";

const Carrito = () => {
    const navigate = useNavigate();

    const {
        cart = [],
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        loading, // Usar loading del contexto
        isAuthenticated, // Asegura que el ID se obtenga correctamente (logueado vs. invitado)
    } = useCart();

    const { user } = useAuth();

    const [errorMessage, setErrorMessage] = useState("");

    const [imagenesProductos, setImagenesProductos] = useState({});

    const idsCargadosRef = useRef(new Set());

    const safeCart = useMemo(() => cart ?? [], [cart]);

// ===============================================
// 1. FUNCIÓN AUXILIAR DE ACCESO A DATOS SEGURO
// ===============================================
    const getProductData =  useCallback ((item) => {
        // En invitado (no autenticado), la data de 'item' podría ser simple (solo idStock y cantidad)
        // En logueado, 'item' es un DetalleCarrito completo.

        const stockRef = item.stock || null;
        const productoRef =stockRef?.producto || item.producto || null;

        console.log("Datos del item:", item);

        const idProducto = productoRef?.idProducto || item.idProducto;
        const idDetalle = isAuthenticated ? item.idDetalleCarrito :  item.idStock ;

        const nombre = productoRef?.nombreProducto || item.nombreProducto || "Producto Desconocido";
        const precio = item.precioUnitario || item.precio|| productoRef?.precio || 0;
        const stockDisponible = stockRef?.stockActual || item.stockActual || item.stockDisponible || 0;
        const cantidad = item.cantidad || 0;

        // Lógica de prioridad de imagen igual que en Home:
        // 1. Imagen del estado (cargada por API)
        // 2. Imagen que venga en el objeto (fallback)
        // 3. Imagen por defecto
        let imagenFinal = "/imagenes_prueba/zapato/default.jpg";
        
        if (idProducto && imagenesProductos[idProducto]) {
            imagenFinal = imagenesProductos[idProducto];
        } else if (item.imagen || productoRef?.imagen) {
            // Si el objeto tiene una ruta, le ponemos el prefijo del servidor si no es una URL completa
            const imgPath = item.imagen || productoRef.imagen;
            imagenFinal = imgPath.startsWith('http') ? imgPath : `http://localhost:8080${imgPath}`;
        }

        return {
            idDetalle, 
            idProducto,
            nombre,
            precio, 
            cantidad,
            stockDisponible,
            imagenUrl: imagenFinal, 
        };
    } , [isAuthenticated, imagenesProductos]);


// ===============================================
    //2.  EFECTO PARA CARGAR IMÁGENES 
    // ===============================================
    useEffect(() => {
        const cargarImagenesCarrito = async () => {
            if (safeCart.length > 0) {
                const nuevasImagenesParaAgregar = {};
                let huboCambios = false;

                for (const item of safeCart) {
                    const data = getProductData(item);
                    const idProducto = data.idProducto;
                    
                    // Solo buscamos si tenemos ID y si NO está ya en nuestro estado local
                    if (idProducto && !idsCargadosRef.current.has(idProducto)) {
                        try {
                            const response = await getImagenById(idProducto);
                            if (response.data && response.data.length > 0) {
                                nuevasImagenesParaAgregar[idProducto] = `http://localhost:8080${response.data[0].urlImagen}`;
                                idsCargadosRef.current.add(idProducto);
                                huboCambios = true;
                            }
                        } catch (error) {
                            console.error("Error al cargar imagen en carrito:", error);
                        }
                    }
                }

                if (huboCambios) {

                    setImagenesProductos(prev => ({
                        ...prev,
                        ...nuevasImagenesParaAgregar
                    }));
                }
            }
        };

        cargarImagenesCarrito();
        // Al usar la actualización funcional arriba, ya no es necesario incluir imagenesProductos aquí
    }, [safeCart, getProductData]);

    // ===============================================
    // 3. LÓGICA DE AUMENTAR/DISMINUIR
    // ===============================================
    
    // AUMENTAR CANTIDAD (validando stock)
    const handleIncreaseQuantity = (item) => {
        const product = getProductData(item);

        if (!product.idDetalle) return; 

        if (product.cantidad < product.stockDisponible) {
            // Llama al contexto con el ID del DetalleCarrito
            increaseQuantity(product.idDetalle);
            setErrorMessage("");
        } else {
            setErrorMessage(`Máximo stock disponible (${product.stockDisponible}) alcanzado para este producto.`);
        }
    };

    // DISMINUIR CANTIDAD (y eliminar si llega a 0)
    const handleDecreaseQuantity = (item) => {
        const product = getProductData(item);

        if (!product.idDetalle) return;

        if (product.cantidad > 1) {
            // Disminuir si es mayor a 1
            decreaseQuantity(product.idDetalle);
            setErrorMessage("");
        } else {
            // Eliminar si la cantidad es 1
            handleRemoveFromCart(product.idDetalle); 
        }
    };

    // ELIMINAR ITEM
    const handleRemoveFromCart = (idDetalle) => {
        removeFromCart(idDetalle);
        setErrorMessage("");
    }


    // ===============================================
    // 3. CÁLCULOS
    // ===============================================
    
    // TOTAL PRODUCTOS (Unidades)
    const totalItems = safeCart.reduce(
        (total, item) => total + (item.cantidad ?? 0),
        0
    );

    // TOTAL PRECIO
    const totalPrice = safeCart.reduce((total, item) => {

        const data = getProductData(item);
        return total + (data.precio * data.cantidad);
        
    }, 0);

    // ===============================================
    // 4. CHECKOUT
    // ===============================================
    const handleCheckout = () => {
        if (!user) {
            sessionStorage.setItem('pendingCheckoutRedirect', '/form-direccion'); // Corregido a /checkout
            sessionStorage.setItem('requireClientRole', 'true');

            setTimeout(() => {
                navigate("/loginpage");
            }, 50);
            
            return;
        }

        navigate("/form-direccion");
    };

    // ===============================================
    // 5. RENDERIZADO
    // ===============================================
    
    if (loading) {
        return <div className="carrito-container loading-state">Cargando carrito...</div>;
    }

    if (safeCart.length === 0) {
        return (
            <div className="carrito-container empty">
                <h2>Tu carrito está vacío 🛒</h2>
                <button className="btn-primary" onClick={() => navigate("/")}>
                    Volver a la tienda
                </button>
            </div>
        );
    }

    return (
        <div className="carrito-container">
            <h2 className="carrito-title">Carrito de compras</h2>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* LISTA DE PRODUCTOS */}
            <div className="carrito-items">
                {safeCart.map((item, index) => {
                    // Usamos la función auxiliar para obtener datos limpios y seguros
                    const product = getProductData(item);
                    const subtotalItem = product.precio * product.cantidad;

                    return (
                        <div key={product.idDetalle || `item-${index}`} className="carrito-item">
                            <img
                                // Se concatena la URL base del backend para la carga de imágenes
                                src={product.imagenUrl}
                                alt={product.nombre}
                                className="carrito-item-img"
                                onError={(e) => {
                                    // 🛑 CORRECCIÓN CRÍTICA: Cambiado 'iamgenes_prueba' a 'imagenes_prueba'
                                    e.target.src = "/imagenes_prueba/default.jpg";
                                }}
                            />

                            <div className="carrito-item-info">
                                <h5>{product.nombre}</h5>

                                <p>
                                    Precio unitario:{" "}
                                    {new Intl.NumberFormat("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                    }).format(product.precio)}
                                </p>

                                {/* CANTIDAD */}
                                <div className="cantidad-controls">
                                    <button
                                        onClick={() => handleDecreaseQuantity(item)}
                                        className="btn-qty"
                                    >
                                        −
                                    </button>

                                    <span>{product.cantidad}</span>

                                    <button
                                        onClick={() => handleIncreaseQuantity(item)}
                                        className="btn-qty"
                                    >
                                        +
                                    </button>
                                </div>

                                <p>
                                    Subtotal:{" "}
                                    {new Intl.NumberFormat("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                    }).format(subtotalItem)}
                                </p>

                                <button
                                    className="btn-remove"
                                    onClick={() => handleRemoveFromCart(product.idDetalle)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* RESUMEN */}
            <div className="carrito-summary">
                <p>
                    <strong>Productos (Unidades):</strong> {totalItems}
                </p>

                <p className="total">
                    <strong>Total:</strong>{" "}
                    {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                    }).format(totalPrice)}
                </p>

                <div className="carrito-actions">
                    <button className="btn-secondary" onClick={clearCart}>
                        Vaciar carrito
                    </button>

                    <button className="btn-primary" onClick={handleCheckout}>
                        {user ? "Proceder al pago" : "Inicia sesión para continuar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Carrito;