import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/carrito/CarritoContext.jsx";
import { useAuth } from "../../context/AuthContext";
import { useGetStock } from "../../hooks/stock/useGetStock";
import MenuHome from "../../layouts/home/menuHome";
import api_url from "../../services/administrador/api";
import { getImagenById } from "../../services/administrador/ImagenService.js";
import ComentariosSeccion from "../../components/comentario/ComentariosSeccion.jsx";
import { useFavoritos } from "../../hooks/favorito/useFavorito";
import "../../styles/home/productGen.css"
import "../../styles/administrador/inventario.css";
import "../../styles/administrador/gestion_producto.css";


const ProductoGen = () => {
    // ===============================================
    // 1. LLAMADA INCONDICIONAL DE TODOS LOS HOOKS 
    // ===============================================
    const { stock: listaStockCompleta } = useGetStock();
    const { codigoReferencia } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const userId = user?.id || user?.idUsuario;
    const isAuthenticated = !!userId;

    const { addToCart, loading: cartLoading, error: cartError, setError: setCartError, setShowCartMenu } = useCart();

    // Usar hook de favoritos
    const { agregarFavorito, eliminarFavorito, verificarProductoEnFavoritos, loading: loadingFavoritos } = useFavoritos();

    // Todos los useState, incondicionalmente, al inicio
    const [quantity, setQuantity] = useState(1);
    const [esFavorito, setEsFavorito] = useState(false);
    const [verificandoFavorito, setVerificandoFavorito] = useState(false);
    const [imagenModal, setImagenModal] = useState(null);
    const [imagenesProducto, setImagenesProducto] = useState([]);
    const [imagenPrincipal, setImagenPrincipal] = useState("");
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);
    const [colorSeleccionado, setColorSeleccionado] = useState("");
    const [tallaSeleccionada, setTallaSeleccionada] = useState("");

    // Estados para estadísticas de comentarios
    const [estadisticasComentarios, setEstadisticasComentarios] = useState({
        promedioCalificacion: 0,
        totalComentarios: 0
    });
    const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);


    // ===============================================
    // 2. LÓGICA DE CÁLCULO (INCONDICIONAL)
    // ===============================================

    // **CALCULAR PRODUCTO BASE:** Se hace después de los Hooks, antes del return condicional
    const productoBaseStockItem = listaStockCompleta.find(p => p.producto?.codigoReferencia === codigoReferencia);
    const producto = productoBaseStockItem?.producto;

    // **useMemo para Stock:** Se llama incondicionalmente, pero su lógica maneja el caso de producto no encontrado/no seleccionado.
    const { stockActual: stockDisponible, idStock: idStockSeleccionado } = useMemo(() => {
        if (!producto || !colorSeleccionado || !tallaSeleccionada) {
            return { stockActual: 0, idStock: null };
        }

        const stockItem = listaStockCompleta.find(item => {
            const itemColorId = String(item.idColor);
            const selectedColorId = String(colorSeleccionado);
            const nombreTallaBD = item.nombre;

            return (
                item.idProducto === producto.idProducto &&
                itemColorId === selectedColorId &&
                String(nombreTallaBD).toLowerCase() === String(tallaSeleccionada).toLowerCase()
            );
        });
        if (stockItem) {
            return {
                stockActual: stockItem.stockActual,
                idStock: stockItem.idStock
            };
        }
        return { stockActual: 0, idStock: null };
    }, [listaStockCompleta, producto, colorSeleccionado, tallaSeleccionada]);

    useEffect(() => {
        // Solo avisamos si el usuario ya eligió ambos (color y talla) pero el resultado es 0
        if (colorSeleccionado && tallaSeleccionada && stockDisponible === 0) {
            console.warn("Sin stock para:", {
            producto: producto?.nombreProducto,
            colorId: colorSeleccionado,
            talla: tallaSeleccionada
           });
        }
    }, [stockDisponible, colorSeleccionado, tallaSeleccionada, producto]);

    // Cálculo del Precio Total
    const totalPrice = producto?.precio ? producto.precio * quantity : 0;

    // ===============================================
    // 3. EFECTOS (useEffects) - Se colocan inmediatamente después de los useStates y useMemo
    // ===============================================

    // ============================
    // 0️⃣ Cargar estadísticas de comentarios
    // ============================
    useEffect(() => {
        const cargarEstadisticasComentarios = async () => {
            if (!producto?.idProducto) return;

            try {
                setCargandoEstadisticas(true);
                const response = await api_url.get(`/comentarios/producto/${producto.idProducto}/estadisticas`);
                if (response.data) {
                    setEstadisticasComentarios({
                        promedioCalificacion: response.data.promedioCalificacion || 0,
                        totalComentarios: response.data.totalComentarios || 0
                    });
                }
            } catch (error) {
                console.error("Error al cargar estadísticas de comentarios:", error);
            } finally {
                setCargandoEstadisticas(false);
            }
        };

        cargarEstadisticasComentarios();
    }, [producto?.idProducto]);

    // ============================
    // 1️⃣ Cargar COLORES del producto
    // ============================

    useEffect(() => {
        if (!producto) return; // Retorno anticipado solo dentro del useEffect

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color`)
            .then(res => {
                setColores(res.data);
            })
            .catch(err => console.error("Error al cargar colores:", err));
    }, [producto]);

    // ============================
    // 2️⃣ Cargar IMÁGENES del producto
    // ============================
    useEffect(() => {
        if (!producto) return; // Retorno anticipado solo dentro del useEffect

        const cargarImagenes = async () => {
            try {
                const response = await getImagenById(producto.idProducto);
                if (response.data && response.data.length > 0) {
                    setImagenesProducto(response.data);
                    setImagenPrincipal(`http://localhost:8080${response.data[0].urlImagen}`);
                } else {
                    setImagenPrincipal(producto.imagen || "/imagenes_prueba/default.jpg");
                }
            } catch (error) {
                console.error("Error al cargar imágenes del producto:", error);
                setImagenPrincipal(producto.imagen || "/imagenes_prueba/default.jpg");
            }
        };

        cargarImagenes();
    }, [producto]);

    // ============================
    // 3️⃣ Cargar TALLAS cuando se selecciona un color
    // ============================
    useEffect(() => {
        // La condición para no hacer la llamada API debe estar DENTRO del useEffect
        if (!producto || !colorSeleccionado) {
            setTallas([]);
            setTallaSeleccionada("");
            return;
        }

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color/${colorSeleccionado}/tallas`)
            .then(res => {
                setTallas(res.data);
                setTallaSeleccionada("");
            })
            .catch(err => console.error("Error al cargar tallas:", err));
    }, [producto, colorSeleccionado]);

    // ============================
    // 6️⃣ VERIFICAR SI EL PRODUCTO ES FAVORITO
    // ============================
    useEffect(() => {
        const verificarEstadoFavorito = async () => {
            if (!isAuthenticated || !userId || !producto?.idProducto) {
                setEsFavorito(false);
                return;
            }

            try {
                setVerificandoFavorito(true);
                const resultado = await verificarProductoEnFavoritos(userId, producto.idProducto);
                setEsFavorito(resultado);
            } catch (error) {
                console.error("Error verificando favorito:", error);
                setEsFavorito(false);
            } finally {
                setVerificandoFavorito(false);
            }
        };

        verificarEstadoFavorito();
    }, [isAuthenticated, userId, producto, verificarProductoEnFavoritos]);



    // ===============================================
    // 4. HANDLERS (Iguales que antes)
    // ===============================================

    // ============================
    // 7️⃣ MANEJAR CLIC EN BOTÓN DE FAVORITOS
    // ============================
    const handleFavoritoClick = async () => {
        if (!isAuthenticated || !userId) {
            alert("Por favor inicia sesión para agregar productos a favoritos");
            navigate('/loginpage');
            return;
        }

        if (!producto?.idProducto) {
            console.error("No se pudo obtener el ID del producto");
            return;
        }

        try {
            if (esFavorito) {
                // Eliminar de favoritos
                await eliminarFavorito(userId, producto.idProducto);
                setEsFavorito(false);
                alert("Producto eliminado de favoritos");
            } else {
                // Agregar a favoritos
                const requestData = { idProducto: producto.idProducto };
                await agregarFavorito(userId, requestData);
                setEsFavorito(true);
                alert("Producto agregado a favoritos");
            }
        } catch (error) {
            console.error("Error al cambiar estado de favorito:", error);
            alert(error.message || "Error al actualizar favoritos");
        }
    };

    // ============================
    // 🔟 Función para manejar carrito CON VALIDACIÓN DE STOCK
    // ============================

    const increaseQuantity = () => {
        if (quantity < stockDisponible) {
            setQuantity(prevQuantity => prevQuantity + 1);
        } else {
            alert(`No puedes seleccionar más de ${stockDisponible} unidad(es)`);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const handleAddToCart = async () => {
        setCartError(null);

        if (!idStockSeleccionado || stockDisponible === 0) {
            setCartError("Debes seleccionar una combinación de color y talla válida.");
            return;
        }

        if (stockDisponible <= 0) {
            setCartError("Lo sentimos, este producto no tiene stock disponible en la combinación seleccionada");
            return;
        }


        if (quantity > stockDisponible) {
            setCartError(`Solo quedan ${stockDisponible} unidades disponibles en stock.`);
            return;
        }

        if (quantity < 1) {
            alert("Debes seleccionar al menos 1 unidad");
            return;
        }

        const productoParaCarrito = {
            idStock: idStockSeleccionado,
            nombreProducto: producto.nombreProducto,
            precio: producto.precio,
            imagen: imagenPrincipal, // La imagen que tienes seleccionada
            stockActual: stockDisponible, // ¡ESTO es lo que te faltaba!
            talla: tallaSeleccionada,
            color: colores.find(c => String(c.idColor) === String(colorSeleccionado))?.nombreColor
        };

        const success = await addToCart(productoParaCarrito, quantity);

        if (success) {
            setShowCartMenu(true);
            alert(`¡Agregado al carrito! ${quantity} unidad(es) de ${producto.nombreProducto} (${tallaSeleccionada})`);
        }

    };

    // ============================
    // 🆕 Función para actualizar estadísticas después de una acción de comentario
    // ============================
    const actualizarEstadisticas = async () => {
        if (!producto?.idProducto) return;

        try {
            const response = await api_url.get(`/comentarios/producto/${producto.idProducto}/estadisticas`);
            if (response.data) {
                setEstadisticasComentarios({
                    promedioCalificacion: response.data.promedioCalificacion || 0,
                    totalComentarios: response.data.totalComentarios || 0
                });
            }
        } catch (error) {
            console.error("Error al actualizar estadísticas de comentarios:", error);
        }
    };


    const abrirModalImagen = (imagenUrl = null) => {
        const imagenAMostrar = imagenUrl || imagenPrincipal;
        setImagenModal({
            imagen: imagenAMostrar,
            nombre: producto.nombreProducto // Usar producto aquí es seguro porque ya pasamos la validación
        });
    };

    const cerrarModalImagen = () => {
        setImagenModal(null);
    };

    const cambiarImagenPrincipal = (nuevaImagenUrl) => {
        setImagenPrincipal(nuevaImagenUrl);
    };


    // ===============================================
    // 5. RENDERIZACIÓN CONDICIONAL (RETURN ANTICIPADO SEGURO)
    // ===============================================

    // Esto se ejecuta DESPUÉS de que todos los Hooks se han llamado, 
    // garantizando que el orden de los Hooks sea siempre el mismo.
    if (!producto) {
        return <h2 className="text-center mt-5" id="producto-no-encontrado">Producto no encontrado</h2>;
    }

    // Verificar si estamos en modo administrador (si hay idProducto en params)
    const esModoAdmin = !!producto?.idProducto;

    // ===============================================
    // 6. RENDERIZACIÓN PRINCIPAL
    // ===============================================

    // ... (El resto del return es igual) ...

    // ============================
    // RENDER DEL BOTÓN DE FAVORITOS
    // ============================
    const renderBotonFavorito = () => {
        if (!isAuthenticated) {
            return (
                <button
                    className="btn producto-btn-favorito btn-outline-danger"
                    onClick={() => navigate('/loginpage')}
                    title="Inicia sesión para agregar a favoritos"
                    id="producto-btn-favorito"
                >
                    <i className="bi bi-heart producto-icono-favorito" id="producto-icono-favorito"></i>
                    Iniciar sesión para favoritos
                </button>
            );
        }

        if (verificandoFavorito) {
            return (
                <button
                    className="btn producto-btn-favorito btn-outline-danger"
                    disabled
                    id="producto-btn-favorito"
                >
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    Verificando...
                </button>
            );
        }

        if (loadingFavoritos) {
            return (
                <button
                    className="btn producto-btn-favorito btn-outline-danger"
                    disabled
                    id="producto-btn-favorito"
                >
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    Procesando...
                </button>
            );
        }

        return (
            <button
                className={`btn producto-btn-favorito ${esFavorito ? "btn-danger" : "btn-outline-danger"}`}
                onClick={handleFavoritoClick}
                id="producto-btn-favorito"
            >
                <i className={`bi ${esFavorito ? "bi-heart-fill" : "bi-heart"} producto-icono-favorito`}
                    id="producto-icono-favorito"></i>
                {esFavorito ? " Quitar favorito" : " Agregar a favoritos"}
            </button>
        );
    };

    // ============================
    // RENDER DE LAS ESTADÍSTICAS DE COMENTARIOS
    // ============================
    const renderEstadisticasComentarios = () => {
        if (cargandoEstadisticas) {
            return (
                <div className="d-flex align-items-center justify-content-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <small className="text-muted">Cargando valoraciones...</small>
                </div>
            );
        }

        const promedio = estadisticasComentarios.promedioCalificacion || 0;
        const total = estadisticasComentarios.totalComentarios || 0;

        if (total === 0) {
            return (
                <div className="producto-calificacion">
                    <span className="text-muted">Sin valoraciones aún</span>
                </div>
            );
        }

        return (
            <div className="producto-calificacion d-flex align-items-center">
                <div className="estrellas me-2">
                    {[1, 2, 3, 4, 5].map((estrella) => (
                        <i
                            key={estrella}
                            className={`bi ${estrella <= promedio ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                        ></i>
                    ))}
                </div>
                <span className="promedio-numerico fw-bold me-2">{promedio.toFixed(1)}</span>
                <span className="text-muted small">({total} {total === 1 ? 'valoración' : 'valoraciones'})</span>
            </div>
        );
    };

    return (
        <div className="producto-detalle-container" id="producto-detalle-container">
            <MenuHome />
            <div className="producto-body-background" id="producto-body-background">
                <div className="container-fluid" id="producto-main-container">
                    <div className="row justify-content-center" id="producto-main-row">
                        <div className="col-md-10 col-lg-8" id="producto-content-col">
                            <div className="producto-card-detalle shadow-sm" id="producto-card-detalle">
                                <div className="producto-card-body-detalle" id="producto-card-body-detalle">

                                    {/* INFO PRINCIPAL */}
                                    <div className="row producto-info-principal" id="producto-info-principal">
                                        <div className="col-md-6 producto-col-imagen" id="producto-col-imagen">
                                            <div className="producto-imagen-container" id="producto-imagen-container">
                                                <img
                                                    src={imagenPrincipal}
                                                    alt={producto.nombreProducto}
                                                    className="producto-imagen-principal img-fluid rounded"
                                                    onClick={() => abrirModalImagen()}
                                                    style={{ cursor: 'pointer' }}
                                                    id="producto-imagen-principal"
                                                />
                                            </div>

                                            {imagenesProducto.length > 1 && (
                                                <div className="producto-miniaturas-container mt-3" id="producto-miniaturas-container">
                                                    <div className="row g-2 justify-content-center" id="producto-miniaturas-row">
                                                        {imagenesProducto.map((imagen, index) => (
                                                            <div key={index} className="col-auto" id={`producto-miniatura-col-${index}`}>
                                                                <img
                                                                    src={`http://localhost:8080${imagen.urlImagen}`}
                                                                    alt={`${producto.nombreProducto} ${index + 1}`}
                                                                    className={`producto-miniatura img-thumbnail ${imagenPrincipal === `http://localhost:8080${imagen.urlImagen}` ? 'miniatura-activa' : ''}`}
                                                                    onClick={() => cambiarImagenPrincipal(`http://localhost:8080${imagen.urlImagen}`)}
                                                                    style={{ cursor: 'pointer', width: '60px', height: '60px', objectFit: 'cover' }}
                                                                    id={`producto-miniatura-${index}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6 producto-col-detalles" id="producto-col-detalles">
                                            <div className="row" id="producto-detalles-row">
                                                <div className="col-12" id="producto-titulo-col">
                                                    <h1 className="producto-titulo-detalle" id="producto-titulo-detalle">{producto.nombreProducto}</h1>
                                                </div>
                                                <div className="col-12" id="producto-info-col">
                                                    <div className="producto-info-basica" id="producto-info-basica">
                                                        <p className="producto-codigo-detalle" id="producto-codigo-detalle">
                                                            Código: <span id="producto-codigo-valor">{producto.codigoReferencia}</span>
                                                        </p>
                                                        <p className="producto-precio-detalle" id="producto-precio-detalle">
                                                            Precio: <span className="producto-precio-valor" id="producto-precio-valor">${producto.precio?.toLocaleString()}</span>
                                                        </p>

                                                        {/* VALORACIÓN DE COMENTARIOS */}
                                                        <div className="producto-valoracion-detalle mb-3" id="producto-valoracion-detalle">
                                                            Valoración: {renderEstadisticasComentarios()}
                                                        </div>

                                                        <p className="producto-descripcion-detalle" id="producto-descripcion-detalle">
                                                            <span id="producto-descripcion-valor">{producto.descripcion}</span>
                                                        </p>
                                                    </div>

                                                    <div className="producto-info-adicional mt-4" id="producto-info-adicional">
                                                        <h2 className="producto-subtitulo-adicional" id="producto-subtitulo-adicional">Detalles del producto</h2>
                                                        <div className="producto-detalles-grid" id="producto-detalles-grid">
                                                            <p className="producto-categoria-detalle" id="producto-categoria-detalle">
                                                                <span className="producto-detalle-label" id="producto-categoria-label">Categoría:</span>
                                                                <span className="producto-detalle-valor" id="producto-categoria-valor">{producto.categoria?.nombreCategoria || 'N/A'}</span>
                                                            </p>
                                                            <p className="producto-tipo-detalle" id="producto-tipo-detalle">
                                                                <span className="producto-detalle-label" id="producto-tipo-label">Tipo:</span>
                                                                <span className="producto-detalle-valor" id="producto-tipo-valor">{producto.categoria?.tipoProducto?.nombreTipoProducto || 'N/A'}</span>
                                                            </p>
                                                            <p className="producto-genero-detalle" id="producto-genero-detalle">
                                                                <span className="producto-detalle-label" id="producto-genero-label">Género:</span>
                                                                <span className="producto-detalle-valor" id="producto-genero-valor">{producto.tipoPublico?.nombrePublico || 'N/A'}</span>
                                                            </p>
                                                            <p className="producto-material-detalle" id="producto-material-detalle">
                                                                <span className="producto-detalle-label" id="producto-material-label">Material:</span>
                                                                <span className="producto-detalle-valor" id="producto-material-valor">{producto.material?.nombreMaterial || 'N/A'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SELECTORES COLORES Y TALLAS */}
                                    <div className="row producto-selectores-fila mt-4" id="producto-selectores-fila">
                                        <h2 className="producto-subtitulo-selectores" id="producto-subtitulo-selectores">Selecciona tus opciones</h2>
                                        <div className="col-md-6" id="producto-selector-color-col">
                                            <label className="form-label producto-label-selector" id="producto-label-color">Color:</label>
                                            <select
                                                className="form-select producto-select-color"
                                                value={colorSeleccionado}
                                                onChange={(e) => {
                                                    setColorSeleccionado(e.target.value);
                                                    setQuantity(1);
                                                }}
                                                id="producto-select-color"
                                            >
                                                <option value="" id="producto-option-color-default">Seleccione un color</option>
                                                {colores.map((color) => (
                                                    <option key={color.idColor} value={color.idColor} id={`producto-option-color-${color.idColor}`}>
                                                        {color.nombreColor}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6" id="producto-selector-talla-col">
                                            <label className="form-label producto-label-selector" id="producto-label-talla">Talla:</label>
                                            <select
                                                className="form-select producto-select-talla"
                                                value={tallaSeleccionada}
                                                onChange={(e) => {
                                                    setTallaSeleccionada(e.target.value);
                                                    setQuantity(1);
                                                }}
                                                disabled={!colorSeleccionado || tallas.length === 0}
                                                id="producto-select-talla"
                                            >
                                                <option value="" id="producto-option-talla-default">Seleccione una talla</option>
                                                {tallas.map((talla, index) => (
                                                    <option key={index} value={talla.nombre} id={`producto-option-talla-${index}`}>
                                                        {talla.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* CARRITO: CONTROLES DE CANTIDAD Y STOCK */}
                                    <div className="row producto-stock-cantidad-fila mt-4 align-items-center" id="producto-stock-cantidad-fila">
                                        {/* 1. BLOQUE DE STOCK DINÁMICO (Insertado justo aquí) */}
                                        {colorSeleccionado && tallaSeleccionada && (
                                            <div className="col-12 mb-3" id="producto-alerta-stock-dinamico">
                                                <div className={`alert ${stockDisponible > 0 ? 'alert-info' : 'alert-danger'} d-flex align-items-center`}>
                                                    <i className={`bi ${stockDisponible > 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                                    <div>
                                                        <strong>
                                                            {stockDisponible > 0
                                                                ? `Stock disponible: ${stockDisponible} unidad(es) disponibles`
                                                                : "Sin stock disponible para esta selección"}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-md-6" id="producto-stock-col">
                                            <p className={`producto-stock-detalle ${stockDisponible > 0 ? 'text-success' : 'text-danger'} mb-0`} id="producto-stock-detalle">
                                                <strong>Stock Disponible:</strong> <span id="producto-stock-valor">{stockDisponible}</span>
                                            </p>
                                        </div>

                                        <div className="col-md-6" id="producto-cantidad-col">
                                            <label className="form-label producto-label-cantidad">
                                                Cantidad{stockDisponible > 0 && `(Máximo: ${stockDisponible})`}:
                                            </label>
                                            <div className="input-group" id="producto-input-group-cantidad">
                                                <button
                                                    className="btn btn-outline-secondary producto-btn-cantidad-menos"
                                                    type="button"
                                                    onClick={decreaseQuantity}
                                                    disabled={quantity <= 1 || stockDisponible <= 0 || cartLoading}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    className="form-control text-center producto-input-cantidad"
                                                    value={quantity}
                                                    readOnly
                                                    id="producto-input-cantidad"
                                                />
                                                <button
                                                    className="btn btn-outline-secondary producto-btn-cantidad-mas"
                                                    type="button"
                                                    onClick={increaseQuantity}
                                                    disabled={quantity >= stockDisponible || cartLoading || stockDisponible <= 0}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* CARRITO: PRECIO TOTAL */}
                                        <div className="col-12 mt-3" id="producto-precio-total-col">
                                            <h4 className="producto-precio-total-detalle mb-0">
                                                <strong>Precio Total:</strong>{" "}
                                                <span id="producto-precio-total-valor">
                                                    {new Intl.NumberFormat("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                    }).format(totalPrice)}
                                                </span>
                                            </h4>
                                        </div>
                                    </div>

                                    {/* CARRITO: MENSAJE DE ERROR DEL CARRITO */}
                                    {(cartError && <div className="alert alert-danger mt-3" id="producto-cart-error-alert">{cartError}</div>)}


                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="row producto-botones-fila justify-content-center mt-4" id="producto-botones-fila">
                                        <div className="col-auto" id="producto-boton-favorito-col">
                                            {renderBotonFavorito()}
                                        </div>

                                        {/* CARRITO: Botón Agregar al Carrito */}

                                        <div className="col-auto" id="producto-boton-comprar-col">
                                            <button
                                                className="btn producto-btn-comprar btn-success"
                                                onClick={handleAddToCart}
                                                disabled={cartLoading || !idStockSeleccionado || stockDisponible <= 0 || quantity < 1}
                                                id="producto-btn-comprar"
                                            >
                                                {cartLoading ? (
                                                    <>
                                                        <i className="bi bi-arrow-clockwise me-2 spin-animation" id="producto-icono-cargando"></i>
                                                        Añadiendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cart-plus producto-icono-comprar me-2" id="producto-icono-comprar"></i>
                                                        {stockDisponible <= 0 && idStockSeleccionado ? "Sin stock" : " Agregar al Carrito"}
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="col-auto" id="producto-boton-volver-col">
                                            <Link to="/Catalogo" className="btn producto-btn-volver btn-outline-secondary" id="producto-btn-volver">
                                                <i className="bi bi-arrow-left producto-icono-volver me-2" id="producto-icono-volver"></i>
                                                Volver al catálogo
                                            </Link>
                                        </div>
                                    </div>

                                    {/* ENLACE A FAVORITOS */}
                                    {isAuthenticated && !esModoAdmin && (
                                        <div className="row mt-3" id="producto-enlace-favoritos-fila">
                                            <div className="col-12 text-center" id="producto-enlace-favoritos-col">
                                                <Link to="/favoritos" className="btn btn-link text-decoration-none" id="producto-enlace-favoritos">
                                                    <i className="bi bi-heart-fill text-danger me-2"></i>
                                                    Ver todos mis favoritos
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {/* SECCIÓN DE COMENTARIOS */}
                                    {!esModoAdmin && (
                                        <div className="row mt-5" id="producto-seccion-comentarios-fila">
                                            <div className="col-12" id="producto-seccion-comentarios-col">
                                                <ComentariosSeccion
                                                    productoId={producto.idProducto}
                                                    actualizarEstadisticas={actualizarEstadisticas}
                                                />
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PARA VER IMAGEN */}
            {imagenModal && (
                <div className="modal-overlay" onClick={cerrarModalImagen} id="producto-modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} id="producto-modal-content">
                        <div className="modal-header" id="producto-modal-header">
                            <h3 id="producto-modal-titulo">{imagenModal.nombre}</h3>
                            <button className="close-button" onClick={cerrarModalImagen} id="producto-modal-close">×</button>
                        </div>
                        <div className="modal-body" id="producto-modal-body">
                            <img
                                src={imagenModal.imagen}
                                alt={imagenModal.nombre}
                                className="modal-image"
                                id="producto-modal-image"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ProductoGen;