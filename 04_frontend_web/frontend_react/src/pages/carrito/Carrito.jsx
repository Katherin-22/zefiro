import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../components/carrito/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import { getImagenById } from "../../services/administrador/ImagenService";
import "../../styles/Carrito/EstiloCarrito.css";
import BotonAtras from "../../hooks/boton/BotonAtras";
import api_url from "../../services/administrador/api";

const Carrito = () => {
    const navigate = useNavigate();

    const {
        cart = [],
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        loading,
        isAuthenticated,
    } = useCart();

    const { user } = useAuth();

    const [errorMessage, setErrorMessage] = useState("");
    const [imagenesProductos, setImagenesProductos] = useState({});
    const idsCargadosRef = useRef(new Set());
    const safeCart = useMemo(() => cart ?? [], [cart]);

    // ===============================================
    // 1. FUNCIÓN AUXILIAR DE ACCESO A DATOS SEGURO
    // ===============================================
    const getProductData = useCallback((item) => {
        const stockRef = item.stock || null;
        const productoRef = stockRef?.producto || item.producto || null;

        console.log("=== DATOS COMPLETOS DEL ITEM ===");
        console.log("Item:", JSON.stringify(item, null, 2));
        console.log("stockRef:", stockRef);
        console.log("productoRef:", productoRef);

        const idProducto = productoRef?.idProducto || item.idProducto;
        const idDetalle = isAuthenticated ? item.idDetalleCarrito : item.idStock;

        const nombre = productoRef?.nombreProducto || item.nombreProducto || "Producto Desconocido";
        const precio = item.precioUnitario || item.precio || productoRef?.precio || 0;
        const stockDisponible = stockRef?.stockActual || item.stockActual || item.stockDisponible || 0;
        const cantidad = item.cantidad || 0;

        // 🎨 EXTRAER COLOR
        let color = "";
        if (item.color) color = item.color;
        else if (item.nombreColor) color = item.nombreColor;
        else if (stockRef?.color?.nombreColor) color = stockRef.color.nombreColor;
        else if (stockRef?.nombreColor) color = stockRef.nombreColor;

        // 📏 EXTRAER TALLA - CORREGIDO: La talla está en stock.variacion.nombre
        let talla = "";

        // Buscar en stock.variacion.nombre (esta es la ubicación correcta según tu JSON)
        if (stockRef?.variacion?.nombre) {
            talla = stockRef.variacion.nombre;
            console.log("✅ Talla encontrada en stock.variacion.nombre:", talla);
        }
        // Fallbacks por si acaso
        else if (item.talla) talla = item.talla;
        else if (item.nombreTalla) talla = item.nombreTalla;
        else if (stockRef?.talla?.nombre) talla = stockRef.talla.nombre;
        else if (stockRef?.nombre) talla = stockRef.nombre;

        // Lógica de prioridad de imagen
        let imagenFinal = "/imagenes_prueba/zapato/default.jpg";

        if (idProducto && imagenesProductos[idProducto]) {
            imagenFinal = imagenesProductos[idProducto];
        } else if (item.imagen || productoRef?.imagen) {
            const imgPath = item.imagen || productoRef.imagen;
            imagenFinal = imgPath.startsWith('http') ? imgPath : `http://35.171.131.177:8080${imgPath}`;
        }

        console.log(`=== RESULTADO FINAL ===`);
        console.log(`Producto: ${nombre}`);
        console.log(`Color encontrado: "${color}"`);
        console.log(`Talla encontrada: "${talla}"`);

        return {
            idDetalle,
            idProducto,
            nombre,
            precio,
            cantidad,
            stockDisponible,
            imagenUrl: imagenFinal,
            color,
            talla,
        };
    }, [isAuthenticated, imagenesProductos]);

    // ===============================================
    // 2. EFECTO PARA CARGAR IMÁGENES 
    // ===============================================
    useEffect(() => {
        const cargarImagenesCarrito = async () => {
            if (safeCart.length > 0) {
                const nuevasImagenesParaAgregar = {};
                let huboCambios = false;

                for (const item of safeCart) {
                    const data = getProductData(item);
                    const idProducto = data.idProducto;

                    if (idProducto && !idsCargadosRef.current.has(idProducto)) {
                        try {
                            const response = await getImagenById(idProducto);
                            if (response.data && response.data.length > 0) {
                                nuevasImagenesParaAgregar[idProducto] = `http://35.171.131.177:8080${response.data[0].urlImagen}`;
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
    }, [safeCart, getProductData]);

    // ===============================================
    // 3. LÓGICA DE AUMENTAR/DISMINUIR
    // ===============================================
    const handleIncreaseQuantity = (item) => {
        const product = getProductData(item);

        if (!product.idDetalle) return;

        if (product.cantidad < product.stockDisponible) {
            increaseQuantity(product.idDetalle);
            setErrorMessage("");
        } else {
            setErrorMessage(`Máximo stock disponible (${product.stockDisponible}) alcanzado para este producto.`);
        }
    };

    const handleDecreaseQuantity = (item) => {
        const product = getProductData(item);

        if (!product.idDetalle) return;

        if (product.cantidad > 1) {
            decreaseQuantity(product.idDetalle);
            setErrorMessage("");
        } else {
            handleRemoveFromCart(product.idDetalle);
        }
    };

    const handleRemoveFromCart = (idDetalle) => {
        removeFromCart(idDetalle);
        setErrorMessage("");
    }

    // ===============================================
    // 4. CÁLCULOS
    // ===============================================
    const totalItems = safeCart.reduce(
        (total, item) => total + (item.cantidad ?? 0),
        0
    );

    const totalPrice = safeCart.reduce((total, item) => {
        const data = getProductData(item);
        return total + (data.precio * data.cantidad);
    }, 0);

    // ===============================================
    // 5. CHECKOUT
    // ===============================================
    const handleCheckout = () => {
        if (!user) {
            sessionStorage.setItem('pendingCheckoutRedirect', '/form-direccion');
            sessionStorage.setItem('requireClientRole', 'true');

            setTimeout(() => {
                navigate("/loginpage");
            }, 50);

            return;
        }

        navigate("/form-direccion");
    };

    // ===============================================
    // 6. RENDERIZADO
    // ===============================================
    if (loading) {
        return <div className="carrito-container loading-state">Cargando carrito...</div>;
    }

    if (safeCart.length === 0) {
        return (
            <div className="carrito-container empty ">
                <h2 className="h2-empty">Tu carrito está vacío 🛒</h2>
                <button className="btn-primary" onClick={() => navigate("/")}>
                    Volver a la tienda
                </button>
            </div>
        );
    }

    return (
        <div className="carrito-container full">
            <BotonAtras />
            <h2 className="carrito-title">Carrito de compras</h2>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* LISTA DE PRODUCTOS */}
            <div className="row">
                <div className="col-md-8 prod-col">
                    <div className="carrito-items">
                        {safeCart.map((item, index) => {
                            const product = getProductData(item);
                            const subtotalItem = product.precio * product.cantidad;

                            return (
                                <div key={product.idDetalle || `item-${index}`} className="carrito-item">
                                    <img
                                        src={product.imagenUrl}
                                        alt={product.nombre}
                                        className="carrito-item-img"
                                        onError={(e) => {
                                            e.target.src = "/imagenes_prueba/default.jpg";
                                        }}
                                    />

                                    <div className="carrito-item-info">
                                        <h5>{product.nombre}</h5>

                                        {/* MOSTRAR COLOR Y TALLA */}
                                        <div className="producto-variantes mb-3">
                                            {product.color && (
                                                <span className="badge bg-light text-dark me-2 border">
                                                    <i className="bi bi-palette me-1"></i>
                                                    Color: <strong>{product.color}</strong>
                                                </span>
                                            )}
                                            {product.talla && (
                                                <span className="badge bg-light text-dark border">
                                                    <i className="bi bi-rulers me-1"></i>
                                                    Talla: <strong>{product.talla}</strong>
                                                </span>
                                            )}
                                            {!product.color && !product.talla && (
                                                <span className="badge bg-light text-muted border">
                                                    <i className="bi bi-box me-1"></i>
                                                    Producto simple
                                                </span>
                                            )}
                                        </div>



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
                </div>

                {/* RESUMEN */}
                <div className="col-md-4 info-col">
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
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                                        clearCart();
                                    }
                                }}
                            >
                                Vaciar carrito
                            </button>

                            <button className="proceder-btn btn-primary" onClick={handleCheckout}>
                                {user ? "Proceder al pago" : "Inicia sesión para continuar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrito;