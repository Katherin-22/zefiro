import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetStock } from "../../hooks/stock/useGetStock";
import MenuHome from "../../layouts/home/menuHome";
import "../../styles/home/productGen.css";
import ComentariosSeccion from "../../components/comentario/ComentariosSeccion.jsx";
import "../../styles/administrador/inventario.css";
import "../../styles/administrador/gestion_producto.css";
import api_url from "../../services/administrador/api";
import { getImagenById } from "../../services/administrador/ImagenService.js";
import { useFavoritos } from "../../hooks/favorito/useFavorito";
import useAuth from "../../hooks/token/useAuth";
import { getStockByProducto, deleteStock } from "../../services/administrador/StockService";
import { useCart } from "../../components/carrito/CarritoContext.jsx";

const ProductoGen = () => {
    const { stock } = useGetStock();
    const { codigoReferencia, idProducto } = useParams();
    const navigate = useNavigate();

    // Auth
    const { isAuthenticated, userData } = useAuth();
    const userId = userData?.idUsuario || userData?.id;

    // Determinar si es admin o cliente basado en el rol
    const esAdmin = userData?.rol === 2; // Asumiendo que rol 2 = admin
    const esCliente = userData?.rol === 1; // Asumiendo que rol 1 = cliente

    // Carrito Context
    const { addToCart, loading: cartLoading, error: cartError, setError: setCartError, setShowCartMenu } = useCart();

    // Favoritos
    const {
        agregarFavorito,
        eliminarFavorito,
        verificarProductoEnFavoritos,
        loading: loadingFavoritos
    } = useFavoritos();

    // Buscar producto por códigoReferencia
    const producto = stock.find(p => p.codigoReferencia === codigoReferencia);

    // Estados para el stock específico
    const [stockEspecifico, setStockEspecifico] = useState([]);
    const [loadingStock, setLoadingStock] = useState(false);
    const [nombreProductoStock, setNombreProductoStock] = useState("");
    const [cantidad, setCantidad] = useState(1);

    const [esFavorito, setEsFavorito] = useState(false);
    const [verificandoFavorito, setVerificandoFavorito] = useState(false);
    const [imagenModal, setImagenModal] = useState(null);
    const [imagenesProducto, setImagenesProducto] = useState([]);
    const [imagenPrincipal, setImagenPrincipal] = useState("");
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);
    const [colorSeleccionado, setColorSeleccionado] = useState("");
    const [tallaSeleccionada, setTallaSeleccionada] = useState("");

    // Estados para manejar stock disponible
    const [stockDisponible, setStockDisponible] = useState(0);
    const [verificandoStock, setVerificandoStock] = useState(false);
    const [mensajeStock, setMensajeStock] = useState("");

    // Estados para estadísticas de comentarios
    const [estadisticasComentarios, setEstadisticasComentarios] = useState({
        promedioCalificacion: 0,
        totalComentarios: 0
    });
    const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);

    // ============================
    // 0️⃣ LIMPIEZA DE ESTADOS AL CAMBIAR DE PRODUCTO
    // ============================
    useEffect(() => {
        setColorSeleccionado("");
        setTallaSeleccionada("");
        setTallas([]);
        setCantidad(1);
        setMensajeStock("");
        setCartError(null);
    }, [codigoReferencia, setCartError]);

    // ============================
    // 1️⃣ Cargar estadísticas de comentarios
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
    // 2️⃣ Cargar COLORES del producto
    // ============================
    useEffect(() => {
        if (!producto) return;

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color`)
            .then(res => {
                setColores(res.data);
            })
            .catch(err => console.error("Error al cargar colores:", err));
    }, [producto]);

    // ============================
    // 3️⃣ Cargar IMÁGENES del producto
    // ============================
    useEffect(() => {
        if (!producto) return;

        const cargarImagenes = async () => {
            try {
                const response = await getImagenById(producto.idProducto);
                if (response.data && response.data.length > 0) {
                    setImagenesProducto(response.data);
                    setImagenPrincipal(`${api_url}${response.data[0].urlImagen}`);
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
    // 4️⃣ Cargar TALLAS cuando se selecciona un color
    // ============================
    useEffect(() => {
        if (!producto || !colorSeleccionado) {
            setTallas([]);
            setTallaSeleccionada("");
            setStockDisponible(0);
            setMensajeStock("");
            return;
        }

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color/${colorSeleccionado}/tallas`)
            .then(res => {
                setTallas(res.data);
                setTallaSeleccionada("");
                setStockDisponible(0);
                setMensajeStock("");
            })
            .catch(err => console.error("Error al cargar tallas:", err));
    }, [producto, colorSeleccionado]);

    // ============================
    // 5️⃣ Cargar stock específico cuando se tiene idProducto
    // ============================
    useEffect(() => {
        const fetchStockEspecifico = async () => {
            if (!idProducto && !producto?.idProducto) return;

            const productId = idProducto || producto?.idProducto;

            try {
                setLoadingStock(true);
                const response = await getStockByProducto(productId);
                setStockEspecifico(response.data);
                if (response.data.length > 0) {
                    setNombreProductoStock(response.data[0].nombreProducto);
                }
            } catch (error) {
                console.error("Error al cargar stock específico", error);
            } finally {
                setLoadingStock(false);
            }
        };

        fetchStockEspecifico();
    }, [idProducto, producto?.idProducto]);

    // ============================
    // 6️⃣ VERIFICAR STOCK DISPONIBLE cuando cambia color y talla
    // ============================
    useEffect(() => {
        const verificarStock = async () => {
            if (!producto?.idProducto || !colorSeleccionado || !tallaSeleccionada) {
                setStockDisponible(0);
                setMensajeStock("");
                setCantidad(1);
                return;
            }

            try {
                setVerificandoStock(true);
                setMensajeStock("Verificando stock...");

                // Buscar en stockEspecifico la combinación exacta
                const colorId = parseInt(colorSeleccionado);
                const colorNombre = colores.find(c => c.idColor === colorId)?.nombreColor;

                let stockCombinacion = null;
                if (stockEspecifico.length > 0) {
                    stockCombinacion = stockEspecifico.find(s => {
                        const coincideColor = s.idColor ? s.idColor === colorId : s.nombreColor?.toLowerCase() === colorNombre?.toLowerCase();
                        const coincideTalla = s.nombre?.toLowerCase() === tallaSeleccionada.toLowerCase();
                        return coincideColor && coincideTalla;
                    });
                }

                if (stockCombinacion) {
                    const disponible = stockCombinacion.stockActual || 0;
                    setStockDisponible(disponible);

                    if (disponible > 0) {
                        setMensajeStock(`${disponible} unidad(es) disponibles`);
                        if (cantidad > disponible) {
                            setCantidad(disponible);
                        }
                    } else {
                        setMensajeStock("Sin stock disponible");
                        setCantidad(0);
                    }
                } else {
                    // Si no está en stockEspecifico, consultar API directamente
                    try {
                        const response = await api_url.get(`/publico/stock/producto/${producto.idProducto}/color/${colorSeleccionado}/talla/${tallaSeleccionada}`);
                        if (response.data && response.data.stockActual !== undefined) {
                            const disponible = response.data.stockActual;
                            setStockDisponible(disponible);

                            if (disponible > 0) {
                                setMensajeStock(`${disponible} unidad(es) disponibles`);
                                if (cantidad > disponible) {
                                    setCantidad(disponible);
                                }
                            } else {
                                setMensajeStock("Sin stock disponible");
                                setCantidad(0);
                            }
                        } else {
                            setStockDisponible(0);
                            setMensajeStock("Combinación no disponible");
                            setCantidad(0);
                        }
                    } catch (apiError) {
                        console.error("Error al verificar stock por API:", apiError);
                        setStockDisponible(0);
                        setMensajeStock("Error al verificar stock");
                        setCantidad(0);
                    }
                }
            } catch (error) {
                console.error("Error verificando stock:", error);
                setStockDisponible(0);
                setMensajeStock("Error al verificar stock");
                setCantidad(0);
            } finally {
                setVerificandoStock(false);
            }
        };

        verificarStock();
    }, [producto, colorSeleccionado, tallaSeleccionada, stockEspecifico, colores, cantidad]);

    // ============================
    // 7️⃣ VERIFICAR SI EL PRODUCTO ES FAVORITO (solo para clientes)
    // ============================
    useEffect(() => {
        const verificarEstadoFavorito = async () => {
            // Solo verificar si es cliente autenticado
            if (!isAuthenticated || !userId || esAdmin || !producto?.idProducto) {
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
    }, [isAuthenticated, userId, esAdmin, producto, verificarProductoEnFavoritos]);

    // ============================
    // 8️⃣ Función para obtener el idStock de la combinación seleccionada
    // ============================
    const obtenerIdStockSeleccionado = () => {
        if (!producto?.idProducto || !colorSeleccionado || !tallaSeleccionada) return null;

        const colorId = parseInt(colorSeleccionado);
        const colorNombre = colores.find(c => c.idColor === colorId)?.nombreColor;

        // Buscar en stockEspecifico
        const stockEncontrado = stockEspecifico.find(s => {
            const coincideColor = s.idColor ? s.idColor === colorId : s.nombreColor?.toLowerCase() === colorNombre?.toLowerCase();
            const coincideTalla = s.nombre?.toLowerCase() === tallaSeleccionada.toLowerCase();
            return coincideColor && coincideTalla;
        });

        return stockEncontrado?.idStock || null;
    };

    // ============================
    // 9️⃣ Función para obtener el objeto color seleccionado
    // ============================
    const obtenerColorSeleccionado = () => {
        if (!colorSeleccionado) return null;
        const colorId = parseInt(colorSeleccionado);
        return colores.find(c => c.idColor === colorId)?.nombreColor || '';
    };

    // ============================
    // 🔟 MANEJAR CLIC EN BOTÓN DE FAVORITOS
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
                await eliminarFavorito(userId, producto.idProducto);
                setEsFavorito(false);
                alert("Producto eliminado de favoritos");
            } else {
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
    // 1️⃣1️⃣ Función para eliminar stock (solo admin)
    // ============================
    const handleDeleteStock = async (idStock) => {
        if (!window.confirm("¿Estás seguro de eliminar este stock?")) return;

        try {
            await deleteStock(idStock);
            setStockEspecifico(stockEspecifico.filter(s => s.idStock !== idStock));
            alert("Stock eliminado");
        } catch (error) {
            console.error("Error al eliminar stock", error);
            alert("No se pudo eliminar el stock. Revisa si tiene relaciones activas.");
        }
    };

    // ============================
    // 1️⃣2️⃣ Manejar cambios en cantidad
    // ============================
    const handleCantidadChange = (e) => {
        const value = parseInt(e.target.value) || 0;

        if (value < 1) {
            setCantidad(1);
        } else if (value > stockDisponible) {
            alert(`No puedes seleccionar más de ${stockDisponible} unidad(es)`);
            setCantidad(stockDisponible);
        } else {
            setCantidad(value);
        }
    };

    const incrementarCantidad = () => {
        if (cantidad < stockDisponible) {
            setCantidad(cantidad + 1);
        } else {
            alert(`No puedes seleccionar más de ${stockDisponible} unidad(es)`);
        }
    };

    const decrementarCantidad = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };

    // ============================
    // 1️⃣3️⃣ Función para manejar carrito (AGREGAR AL CARRITO)
    // ============================
    const handleAddToCart = async () => {
        setCartError(null);

        if (!colorSeleccionado || !tallaSeleccionada) {
            setCartError("Debes seleccionar una combinación de color y talla válida.");
            return;
        }

        if (stockDisponible <= 0) {
            setCartError("Lo sentimos, este producto no tiene stock disponible en la combinación seleccionada");
            return;
        }

        if (cantidad > stockDisponible) {
            setCartError(`Solo quedan ${stockDisponible} unidades disponibles en stock.`);
            return;
        }

        if (cantidad < 1) {
            setCartError("Debes seleccionar al menos 1 unidad");
            return;
        }

        // Validar autenticación
        if (!isAuthenticated || !userId) {
            alert("Por favor inicia sesión para agregar productos al carrito");
            navigate('/loginpage');
            return;
        }

        // Obtener idStock
        const idStock = obtenerIdStockSeleccionado();
        if (!idStock) {
            setCartError("No se pudo identificar el stock del producto. Intenta nuevamente.");
            console.error("No se encontró idStock para la combinación:", { colorSeleccionado, tallaSeleccionada });
            return;
        }

        // Preparar producto para el carrito
        const productoParaCarrito = {
            idStock: idStock,
            nombreProducto: producto.nombreProducto,
            precio: producto.precio,
            imagen: imagenPrincipal,
            stockActual: stockDisponible,
            talla: tallaSeleccionada,
            color: obtenerColorSeleccionado()
        };

        // Usar la función addToCart del contexto
        const success = await addToCart(productoParaCarrito, cantidad);

        if (success) {
            setShowCartMenu(true);
            alert(`✅ ${cantidad} unidad(es) de ${producto.nombreProducto} agregada(s) al carrito`);

            // Disparar evento para actualizar el contador del carrito en el header
            window.dispatchEvent(new CustomEvent('carritoActualizado', {
                detail: { action: 'agregar', cantidad }
            }));
        }
    };

    // ============================
    // 🆕 Actualizar estadísticas de comentarios
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
            nombre: producto.nombreProducto
        });
    };

    const cerrarModalImagen = () => {
        setImagenModal(null);
    };

    const cambiarImagenPrincipal = (nuevaImagenUrl) => {
        setImagenPrincipal(nuevaImagenUrl);
    };

    // Calcular precio total
    const totalPrice = producto?.precio ? producto.precio * cantidad : 0;

    if (!producto) {
        return <h2 className="text-center mt-5" id="producto-no-encontrado">Producto no encontrado</h2>;
    }

    // Verificar si estamos en modo administrador (si hay idProducto en params)
    const esModoAdmin = !!idProducto;

    // ============================
    // RENDER DEL BOTÓN DE FAVORITOS (con validación de rol)
    // ============================
    const renderBotonFavorito = () => {
        // Si es admin, mostrar botón deshabilitado (aunque no debería llegar aquí)
    

        // Si no está autenticado
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

        // Si es cliente pero está verificando
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

        // Si es cliente y está cargando
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

        // Si es cliente, mostrar botón normal de favoritos
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

                    {/* HEADER PARA MODO ADMINISTRADOR */}
                    {esModoAdmin && (
                        <div className="header mb-4">
                            <div className="row custom-header">
                                <div className="col-3 d-flex align-items-center justify-content-between">
                                    <h1 className="mb-0">Stock - {nombreProductoStock || producto?.nombreProducto}</h1>
                                </div>
                                <div className="col-9 d-flex align-items-end px-1 gap-2 w-50">
                                    <Link to={`/stock/${idProducto || producto?.idProducto}`} className="btn custom-btn btn-light">Registrar Stock</Link>
                                    <Link to="/ver_color" className="btn custom-btn btn-light">Color</Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="row justify-content-center" id="producto-main-row">
                        <div className="col-md-10 col-lg-8" id="producto-content-col">
                            <div className="producto-card-detalle shadow-sm" id="producto-card-detalle">
                                <div className="producto-card-body-detalle" id="producto-card-body-detalle">

                                    {/* TABLA DE STOCK PARA ADMINISTRADOR */}
                                    {esModoAdmin && !loadingStock && stockEspecifico.length > 0 && (
                                        <div className="row mb-5">
                                            <div className="col">
                                                <div className="table-responsive">
                                                    <table className="table table-striped table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Talla Disponible</th>
                                                                <th>Color Disponible</th>
                                                                <th>Stock Actual</th>
                                                                <th>Stock Mínimo</th>
                                                                <th>Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {stockEspecifico.map((s) => (
                                                                <tr key={s.idStock}>
                                                                    <td>{s.nombre}</td>
                                                                    <td>{s.nombreColor}</td>
                                                                    <td>{s.stockActual}</td>
                                                                    <td>{s.stockMinimo}</td>
                                                                    <td>
                                                                        <Link
                                                                            to={`/producto/${s.idProducto}/stock/${s.idStock}`}
                                                                            id="boton_agregar"
                                                                            className="btn btn-light me-2"
                                                                        >
                                                                            Editar
                                                                        </Link>
                                                                        <button
                                                                            className="btn btn-light"
                                                                            onClick={() => handleDeleteStock(s.idStock)}
                                                                        >
                                                                            Eliminar
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                                                    src={`${api_url}${imagen.urlImagen}`}
                                                                    alt={`${producto.nombreProducto} ${index + 1}`}
                                                                    className={`producto-miniatura img-thumbnail ${imagenPrincipal === `${api_url}${imagen.urlImagen}` ? 'miniatura-activa' : ''}`}
                                                                    onClick={() => cambiarImagenPrincipal(`${api_url}${imagen.urlImagen}`)}
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
                                                                <span className="producto-detalle-valor" id="producto-categoria-valor">{producto.nombreCategoria}</span>
                                                            </p>
                                                            <p className="producto-tipo-detalle" id="producto-tipo-detalle">
                                                                <span className="producto-detalle-label" id="producto-tipo-label">Tipo:</span>
                                                                <span className="producto-detalle-valor" id="producto-tipo-valor">{producto.nombreTipoProducto}</span>
                                                            </p>
                                                            <p className="producto-genero-detalle" id="producto-genero-detalle">
                                                                <span className="producto-detalle-label" id="producto-genero-label">Género:</span>
                                                                <span className="producto-detalle-valor" id="producto-genero-valor">{producto.nombrePublico}</span>
                                                            </p>
                                                            <p className="producto-material-detalle" id="producto-material-detalle">
                                                                <span className="producto-detalle-label" id="producto-material-label">Material:</span>
                                                                <span className="producto-detalle-valor" id="producto-material-valor">{producto.nombreMaterial}</span>
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
                                                    setTallaSeleccionada("");
                                                    setCantidad(1);
                                                    setCartError(null);
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
                                                    setCantidad(1);
                                                    setCartError(null);
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

                                        {/* MOSTRAR STOCK DISPONIBLE */}
                                        {colorSeleccionado && tallaSeleccionada && (
                                            <div className="col-12 mt-3" id="producto-stock-info-col">
                                                <div className={`alert ${stockDisponible > 0 ? 'alert-info' : 'alert-danger'} d-flex align-items-center`} role="alert" id="producto-stock-alert">
                                                    {verificandoStock ? (
                                                        <div className="d-flex align-items-center">
                                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                                <span className="visually-hidden">Cargando...</span>
                                                            </div>
                                                            Verificando stock disponible...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <i className={`bi ${stockDisponible > 0 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                                            <div>
                                                                <strong>{mensajeStock}</strong>
                                                                {stockDisponible > 0 && stockDisponible <= 5 && (
                                                                    <div className="text-warning mt-1">
                                                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                        ¡Quedan pocas unidades!
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* SELECTOR DE CANTIDAD CON VERIFICACIÓN DE STOCK */}
                                    <div className="row producto-cantidad-fila mt-4" id="producto-cantidad-fila">
                                        <div className="col-md-6 offset-md-3">
                                            <div className="card" id="cant-card">
                                                <div className="card-body">
                                                    <h5 className="card-title mb-3 text-center">
                                                        Cantidad
                                                        {colorSeleccionado && tallaSeleccionada && stockDisponible > 0 && (
                                                            <span className="text-muted fs-6 ms-2">
                                                                (Máximo: {stockDisponible})
                                                            </span>
                                                        )}
                                                    </h5>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={decrementarCantidad}
                                                            disabled={cantidad <= 1 || stockDisponible <= 0 || cartLoading}
                                                        >
                                                            <i className="bi bi-dash"></i>
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={stockDisponible}
                                                            value={cantidad}
                                                            onChange={handleCantidadChange}
                                                            className="form-control text-center mx-3"
                                                            style={{ maxWidth: '80px' }}
                                                            disabled={stockDisponible <= 0 || cartLoading}
                                                        />

                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            onClick={incrementarCantidad}
                                                            disabled={cantidad >= stockDisponible || cartLoading || stockDisponible <= 0}
                                                        >
                                                            <i className="bi bi-plus"></i>
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <h4 className="producto-precio-total-detalle mb-0">
                                                            <small className="text-muted fs-6">Precio total:</small>
                                                            <br />
                                                            <strong className="text-success">
                                                                {new Intl.NumberFormat("es-CO", {
                                                                    style: "currency",
                                                                    currency: "COP",
                                                                    minimumFractionDigits: 0,
                                                                }).format(totalPrice)}
                                                            </strong>
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MENSAJE DE ERROR DEL CARRITO */}
                                    {cartError && (
                                        <div className="alert alert-danger mt-3" id="producto-cart-error-alert">
                                            {cartError}
                                        </div>
                                    )}

                                    {/* BOTONES DE ACCIÓN - MODIFICADO: Botón de favoritos solo para rol 1 */}
                                    <div className="row producto-botones-fila justify-content-center mt-4" id="producto-botones-fila">
                                        {/* SOLO MOSTRAR BOTÓN DE FAVORITOS SI ES ROL 1 (CLIENTE) */}
                                       
                                    
                                            <div className="col-auto" id="producto-boton-favorito-col">
                                                {renderBotonFavorito()}
                                            </div>
                                        

                                        <div className="col-auto" id="producto-boton-comprar-col">
                                            <button
                                                className="btn producto-btn-comprar btn-success"
                                                id="producto-btn-comprar"
                                                onClick={handleAddToCart}
                                                disabled={cartLoading || !obtenerIdStockSeleccionado() || stockDisponible <= 0 || cantidad < 1}
                                                title={cartLoading ? "Procesando..." : !obtenerIdStockSeleccionado() ? "Selecciona color y talla" : stockDisponible <= 0 ? "Sin stock disponible" : cantidad < 1 ? "Selecciona al menos 1 unidad" : "Agregar al carrito"}
                                            >
                                                {cartLoading ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Cargando...</span>
                                                        </div>
                                                        Agregando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cart-plus producto-icono-comprar me-2" id="producto-icono-comprar"></i>
                                                        {stockDisponible <= 0 ? "Sin stock" : "Agregar al carrito"}
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

                                    {/* ENLACE A FAVORITOS - Solo para clientes (rol 1) */}
                                    {isAuthenticated && userData?.rol === 1 && !esModoAdmin && (
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
        </div>
    );
};

export default ProductoGen;