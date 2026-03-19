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
import { deleteStock } from "../../services/administrador/StockService";
import "../../styles/home/productGen.css"
import "../../styles/administrador/inventario.css";
import "../../styles/administrador/gestion_producto.css";


const ProductoGen = () => {
    // ===============================================
    // 1. LLAMADA INCONDICIONAL DE TODOS LOS HOOKS 
    // ===============================================
    const { stock: listaStockCompleta } = useGetStock();
    const { codigoReferencia, idProducto } = useParams();
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
    const [mensajeStock, setMensajeStock] = useState("");
    const [loadingStock, setLoadingStock] = useState(false);

    // Estados para estadísticas de comentarios
    const [estadisticasComentarios, setEstadisticasComentarios] = useState({
        promedioCalificacion: 0,
        totalComentarios: 0
    });
    const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);

    // ===============================================
    // LIMPIEZA DE ESTADOS AL CAMBIAR DE PRODUCTO
    // ===============================================

    useEffect(() => {
        setColorSeleccionado("");
        setTallaSeleccionada("");
        setTallas([]);
        setQuantity(1);
        setMensajeStock("");
    }, [codigoReferencia]);

    // ============================
    // 1️⃣ LÓGICA DE CARGA (Para usar setLoadingStock)
    // ============================
    useEffect(() => {
        // Si la lista de stock se está cargando desde el hook useGetStock
        // podemos sincronizar nuestro estado local loadingStock
        if (listaStockCompleta && listaStockCompleta.length > 0) {
            setLoadingStock(false);
        } else {
            setLoadingStock(true);
        }
    }, [listaStockCompleta]);


    // ===============================================
    // 2. LÓGICA DE CÁLCULO (INCONDICIONAL)
    // ===============================================

    // **CALCULAR PRODUCTO BASE:** Se hace después de los Hooks, antes del return condicional
    const productoBaseStockItem = listaStockCompleta.find(p => p.codigoReferencia === codigoReferencia);
    const producto = productoBaseStockItem;

    // **useMemo para Stock:** Se llama incondicionalmente, pero su lógica maneja el caso de producto no encontrado/no seleccionado.
    const { stockActual: stockDisponible, idStock: idStockSeleccionado, stockEspecifico } = useMemo(() => {
        if (!producto || !colorSeleccionado || !tallaSeleccionada) {
            return { stockActual: 0, idStock: null, stockEspecifico: [] };
        }

        console.log("Primer item del stock:", listaStockCompleta[0]);
        console.log("Producto actual:", producto);
        console.log("Color seleccionado (ID):", colorSeleccionado);
        console.log("Talla seleccionada:", tallaSeleccionada);

        const colorObj = colores.find(c => String(c.idColor) === String(colorSeleccionado));
        const nombreColorBuscado = colorObj ? colorObj.nombreColor.toLowerCase().trim() : "";

        const stockItem = listaStockCompleta.find(item => {

            const matchProducto = String(item.idProducto) === String(producto.idProducto);

            // Verificamos si el nombre del color seleccionado está en el String de colores
            // Ejemplo: ¿"azul" está en "azul, blanco, gris"?
            const listaColoresBD = String(item.nombreColor || "").toLowerCase();
            const matchColor = listaColoresBD.includes(nombreColorBuscado);

            // Verificamos si la talla seleccionada está en el String de tallas
            // Ejemplo: ¿"36" está en "34, 35, 36, 37"?
            const listaTallasBD = String(item.nombre || "").toLowerCase();
            const matchTalla = listaTallasBD.includes(String(tallaSeleccionada).toLowerCase().trim());

            return (
                matchProducto && matchColor && matchTalla
            );
        });
        if (stockItem) {
            return {
                stockActual: stockItem.stockActual,
                idStock: stockItem.idStock || stockItem.idProducto,
                stockEspecifico: stockItem
            };
        }
        return { stockActual: 0, idStock: null };
    }, [listaStockCompleta, producto, colorSeleccionado, tallaSeleccionada, colores]);

    const nombreProductoStock = useMemo(() => {
        return stockEspecifico?.length > 0 ? stockEspecifico[0].nombreProducto : "";
    }, [stockEspecifico]);

    useEffect(() => {
        if (!colorSeleccionado || !tallaSeleccionada) {
            setMensajeStock("");
            return;
        }

        if (stockDisponible > 0) {
            setMensajeStock(`${stockDisponible} unidad(es) disponibles`);

            // Si el usuario tenía una cantidad mayor a la que ahora hay disponible, la ajustamos
            if (quantity > stockDisponible) {
                setQuantity(stockDisponible);
                alert(`Solo hay ${stockDisponible} disponibles. Cantidad ajustada.`);
            }
        } else {
            setMensajeStock("Sin stock disponible");
            setQuantity(1);
        }
    }, [stockDisponible, colorSeleccionado, tallaSeleccionada, quantity]);

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
                const response = await api_url.get(`/api/comentarios/producto/${producto.idProducto}/estadisticas`);;
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
        if (!producto?.idProducto) return; // Retorno anticipado solo dentro del useEffect

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color`)
            .then(res => {
                setColores(res.data);
            })
            .catch(err => console.error("Error al cargar colores:", err));
    }, [producto?.idProducto]);

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
        if (!producto?.idProducto || !colorSeleccionado) {
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
    }, [producto?.idProducto, colorSeleccionado]);

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
    // 8️⃣ Función para eliminar stock (solo si estamos en modo admin)
    // ============================
    const handleDeleteStock = async (idStock) => {
        if (!window.confirm("¿Estás seguro de eliminar este stock?")) return;

        try {
            await deleteStock(idStock);
            window.location.reload();
            alert("Stock eliminado");
        } catch (error) {
            console.error("Error al eliminar stock", error);
            alert("No se pudo eliminar el stock. Revisa si tiene relaciones activas.");
        }
    };

    // ============================
    // 🔟 Función para manejar carrito CON VALIDACIÓN DE STOCK
    // ============================

    const handleCantidadChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value < 1) {
            setQuantity(1);
        } else if (value > stockDisponible) {
            alert(`No puedes seleccionar más de ${stockDisponible} unidad(es)`);
            setQuantity(stockDisponible);
        } else {
            setQuantity(value);
        }
    };

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

        if (!colorSeleccionado || !tallaSeleccionada) {
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
            const response = await api_url.get(`/api/comentarios/producto/${producto.idProducto}/estadisticas`);;
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
    const esModoAdmin = !!idProducto;

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
        <>
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
                                                                    <span className="producto-detalle-valor" id="producto-categoria-valor">{producto.nombreCategoria || 'N/A'}</span>
                                                                </p>
                                                                <p className="producto-tipo-detalle" id="producto-tipo-detalle">
                                                                    <span className="producto-detalle-label" id="producto-tipo-label">Tipo:</span>
                                                                    <span className="producto-detalle-valor" id="producto-tipo-valor">{producto.nombreTipoProducto || 'N/A'}</span>
                                                                </p>
                                                                <p className="producto-genero-detalle" id="producto-genero-detalle">
                                                                    <span className="producto-detalle-label" id="producto-genero-label">Género:</span>
                                                                    <span className="producto-detalle-valor" id="producto-genero-valor">{producto.nombrePublico || 'N/A'}</span>
                                                                </p>
                                                                <p className="producto-material-detalle" id="producto-material-detalle">
                                                                    <span className="producto-detalle-label" id="producto-material-label">Material:</span>
                                                                    <span className="producto-detalle-valor" id="producto-material-valor">{producto.nombreMaterial || 'N/A'}</span>
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
                                                        setQuantity(1);
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
                                                        setQuantity(1);
                                                        setCartError(null)
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
                                                        {loadingStock ? (
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
                                                                    <strong> {mensajeStock} </strong>

                                                                    {stockDisponible > 0 && stockDisponible <= 5 && (
                                                                        <div className="text-warning mt-1" style={{ fontSize: '0.9rem' }}>
                                                                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                            ¡Quedan pocas unidades
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}


                                            <div className="col-md-6" id="producto-stock-col">
                                                <p className={`producto-stock-detalle ${stockDisponible > 0 ? 'text-success' : 'text-danger'} mb-0`} id="producto-stock-detalle">
                                                    <strong>Stock Disponible:</strong> <span id="producto-stock-valor">{stockDisponible}</span>
                                                </p>
                                            </div>

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
                                                                )}:
                                                            </h5>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="d-flex align-items-center justify-content-center">
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={decreaseQuantity}
                                                        disabled={quantity <= 1 || stockDisponible <= 0 || cartLoading}
                                                    >
                                                        <i className="bi bi-dash"></i>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={stockDisponible}
                                                        value={quantity}
                                                        onChange={handleCantidadChange}
                                                        className="form-control text-center number"
                                                        style={{ maxWidth: '80px' }}
                                                        disabled={stockDisponible <= 0 || cartLoading}
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={increaseQuantity}
                                                        disabled={quantity >= stockDisponible || cartLoading || stockDisponible <= 0}
                                                    >
                                                        <i className="bi bi-plus"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* CARRITO: PRECIO TOTAL */}
                                            <div className="mt-3 text-center">
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
                                                    id="producto-btn-comprar"
                                                    onClick={handleAddToCart}
                                                    disabled={cartLoading || !idStockSeleccionado || stockDisponible <= 0 || quantity < 1}
                                                    title={cartLoading ? "Procesando..." : !idStockSeleccionado ? "Selecciona color y talla" : stockDisponible <= 0 ? "Sin stock disponible" : quantity < 1 ? "Selecciona al menos 1 unidad" : "Agregar al carrito"}
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
                                    </div>

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
            </div >

            {/* MODAL PARA VER IMAGEN */}
            {
                imagenModal && (
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
                )
            }
        </>

    );

};


export default ProductoGen;