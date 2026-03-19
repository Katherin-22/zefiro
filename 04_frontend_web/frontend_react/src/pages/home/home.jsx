// pages/home/home.jsx
import { useEffect, useState, useRef } from "react";
import MenuHome from "../../layouts/home/menuHome";
import Footer from "../../layouts/home/footer";
import { useGetStock } from "../../hooks/stock/useGetStock";
import { getImagenById } from "../../services/administrador/ImagenService.js";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/home/paginaInicio.css";
import { useFavoritos } from "../../hooks/favorito/useFavorito";
import useAuth from "../../hooks/token/useAuth";
import BannerCarousel from "../../hooks/carrrousel/carrousel.js";

export default function Home() {
    // ========== CONTROL DE RENDERS ==========
    const initializationRef = useRef(false);
    // ========================================

    // ========== HOOKS BÁSICOS ==========
    const navigate = useNavigate();
    const { stock, loading, error } = useGetStock();
    const { isAuthenticated, userData } = useAuth();
    const {
        agregarFavorito,
        eliminarFavorito,
        verificarProductoEnFavoritos,
        contarFavoritosUsuario,
        loading: loadingFavoritosGlobal
    } = useFavoritos();
    
    const userId = userData?.idUsuario;

    // ========== ESTADOS ==========
    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(true);
    const [bannerError, setBannerError] = useState("");
    const [zapatos, setZapatos] = useState([]);
    const [bolsos, setBolsos] = useState([]);
    const [imagenesProductos, setImagenesProductos] = useState({});
    const [estadosFavoritos, setEstadosFavoritos] = useState({});
    const [cargandoFavoritos, setCargandoFavoritos] = useState({});
    const [contadorFavoritos, setContadorFavoritos] = useState(0);

    // ========== INICIALIZACIÓN ÚNICA ==========
    useEffect(() => {
        // Evitar cualquier inicialización múltiple
        if (initializationRef.current) return;
        initializationRef.current = true;
        
        console.log("=== 🏠 HOME.JSX INICIALIZADO UNA VEZ ===");
        
        // Función principal que carga TODO de una sola vez
        const inicializarTodo = async () => {
            try {
                console.log("🔄 Iniciando carga completa de la página...");
                
                // 1. Cargar banners (en paralelo con otros procesos)
                cargarBanners();
                
                // 2. Si hay usuario, cargar contador de favoritos
                if (userId) {
                    try {
                        const cantidad = await contarFavoritosUsuario(userId);
                        setContadorFavoritos(cantidad);
                        console.log("✅ Contador favoritos cargado:", cantidad);
                    } catch (error) {
                        console.error("Error cargando contador favoritos:", error);
                    }
                }
                
            } catch (error) {
                console.error("Error en inicialización:", error);
            }
        };
        
        inicializarTodo();
    }, []); // Dependencias vacías - SOLO UNA VEZ

    // ========== CARGAR BANNERS (función separada) ==========
    const cargarBanners = async () => {
        console.log("🔄 Cargando banners...");
        
        try {
            // Intentar endpoint principal
            const response = await fetch('http://35.171.131.177:8080/api/banners');
            
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Banners cargados:", data);
                setBanners(data);
                setBannerError("");
            } else if (response.status === 403) {
                // Intentar endpoint público
                try {
                    const publicResponse = await fetch('http://35.171.131.177:8080/api/banners/public');
                    if (publicResponse.ok) {
                        const publicData = await publicResponse.json();
                        console.log("✅ Banners públicos cargados:", publicData);
                        setBanners(publicData);
                        setBannerError("");
                    } else {
                        throw new Error("Endpoint público falló");
                    }
                } catch {
                    // Fallback a datos mock
                    console.log("🔄 Usando datos mock de banners");
                    setBanners([
                        { id: 1, titulo: 'Bienvenido a Zefiro', imagen: 'https://via.placeholder.com/1920x600/3498db/ffffff?text=Zefiro', urlDestino: '/catalogo', activo: true },
                        { id: 2, titulo: 'Nueva Colección', imagen: 'https://via.placeholder.com/1920x600/e74c3c/ffffff?text=Nueva+Colección', urlDestino: '/catalogo', activo: true },
                        { id: 3, titulo: 'Ofertas Especiales', imagen: 'https://via.placeholder.com/1920x600/2ecc71/ffffff?text=Ofertas', urlDestino: '/catalogo', activo: true }
                    ]);
                    setBannerError("Usando banners de ejemplo");
                }
            } else {
                throw new Error(`Error ${response.status}`);
            }
        } catch (error) {
            console.error("❌ Error cargando banners:", error);
            setBannerError("Error al cargar banners");
            setBanners([
                { id: 1, titulo: 'Bienvenido a Zefiro', imagen: 'https://via.placeholder.com/1920x600/3498db/ffffff?text=Zefiro', urlDestino: '/catalogo', activo: true }
            ]);
        } finally {
            setLoadingBanners(false);
            console.log("🏁 Carga de banners completada");
        }
    };

    // ========== PROCESAR STOCK CUANDO LLEGA ==========
    useEffect(() => {
        if (!stock || stock.length === 0) return;
        
        console.log("🔄 Procesando stock...");
        
        const procesarProductos = async () => {
            // Filtrar productos
            const zapatosTemp = [];
            const bolsosTemp = [];
            const idsProcesados = new Set();
            
            for (const producto of stock) {
                if (!producto.idProducto || idsProcesados.has(producto.idProducto)) continue;
                idsProcesados.add(producto.idProducto);
                
                const tipo = producto.nombreTipoProducto?.toLowerCase() || '';
                const nombre = producto.nombreProducto?.toLowerCase() || '';
                
                // Clasificar producto
                if (tipo.includes('zapato') || tipo.includes('calzado') || 
                    nombre.includes('zapato') || nombre.includes('tenis') || nombre.includes('deportivo')) {
                    if (zapatosTemp.length < 4) {
                        zapatosTemp.push(producto);
                    }
                } else if (tipo.includes('bolso') || nombre.includes('bolso') || 
                           nombre.includes('mochila') || nombre.includes('cartera')) {
                    if (bolsosTemp.length < 4) {
                        bolsosTemp.push(producto);
                    }
                }
            }
            
            setZapatos(zapatosTemp);
            setBolsos(bolsosTemp);
            
            // Cargar imágenes en paralelo
            const productosParaImagenes = [...zapatosTemp, ...bolsosTemp];
            const imagenesTemp = {};
            
            await Promise.all(productosParaImagenes.map(async (producto) => {
                try {
                    const response = await getImagenById(producto.idProducto);
                    if (response.data && response.data.length > 0) {
                        imagenesTemp[producto.idProducto] = `http://35.171.131.177:8080${response.data[0].urlImagen}`;
                    } else {
                        imagenesTemp[producto.idProducto] = producto.imagen || "/imagenes_prueba/default.jpg";
                    }
                } catch {
                    imagenesTemp[producto.idProducto] = producto.imagen || "/imagenes_prueba/default.jpg";
                }
            }));
            
            setImagenesProductos(imagenesTemp);
            console.log("✅ Productos e imágenes cargados");
        };
        
        procesarProductos();
    }, [stock]); // Solo cuando stock cambia

    // ========== VERIFICAR FAVORITOS DE PRODUCTOS ==========
    useEffect(() => {
        if (!userId || !zapatos.length || !bolsos.length) return;
        
        const verificarFavoritos = async () => {
            console.log("🔄 Verificando favoritos...");
            const todosProductos = [...zapatos, ...bolsos];
            const nuevosEstados = {};
            const nuevoCargando = {};
            
            // Inicializar estados
            todosProductos.forEach(producto => {
                if (producto.idProducto) {
                    nuevosEstados[producto.idProducto] = false;
                    nuevoCargando[producto.idProducto] = true;
                }
            });
            
            setEstadosFavoritos(nuevosEstados);
            setCargandoFavoritos(nuevoCargando);
            
            // Verificar todos en paralelo
            await Promise.all(todosProductos.map(async (producto) => {
                if (!producto.idProducto) return;
                
                try {
                    const esFavorito = await verificarProductoEnFavoritos(userId, producto.idProducto);
                    setEstadosFavoritos(prev => ({
                        ...prev,
                        [producto.idProducto]: esFavorito
                    }));
                } catch (error) {
                    console.error(`Error verificando producto ${producto.idProducto}:`, error);
                } finally {
                    setCargandoFavoritos(prev => ({
                        ...prev,
                        [producto.idProducto]: false
                    }));
                }
            }));
            
            console.log("✅ Verificación de favoritos completada");
        };
        
        verificarFavoritos();
    }, [userId, zapatos, bolsos]); // Solo cuando cambian los productos o el usuario

    // ========== MANEJAR CLIC EN FAVORITO ==========
    const handleFavoritoClick = async (producto) => {
        if (!isAuthenticated || !userId) {
            alert("Por favor inicia sesión para agregar productos a favoritos");
            navigate('/loginpage');
            return;
        }

        if (!producto.idProducto) return;

        const productoId = producto.idProducto;
        const esFavoritoActual = estadosFavoritos[productoId];

        try {
            setCargandoFavoritos(prev => ({ ...prev, [productoId]: true }));

            if (esFavoritoActual) {
                await eliminarFavorito(userId, productoId);
                setEstadosFavoritos(prev => ({ ...prev, [productoId]: false }));
                setContadorFavoritos(prev => Math.max(0, prev - 1));
            } else {
                const requestData = { idProducto: productoId };
                await agregarFavorito(userId, requestData);
                setEstadosFavoritos(prev => ({ ...prev, [productoId]: true }));
                setContadorFavoritos(prev => prev + 1);
            }
        } catch (error) {
            console.error("Error al cambiar estado de favorito:", error);
            alert(error.message || "Error al actualizar favoritos");
        } finally {
            setCargandoFavoritos(prev => ({ ...prev, [productoId]: false }));
        }
    };

    // ========== FUNCIÓN AUXILIAR ==========
    const obtenerImagenProducto = (producto) => {
        if (producto.idProducto && imagenesProductos[producto.idProducto]) {
            return imagenesProductos[producto.idProducto];
        }
        return producto.imagen || "/imagenes_prueba/default.jpg";
    };

    // ========== COMPONENTE PRODUCTO CARD ==========
    const ProductoCard = ({ producto, tipo, index }) => {
        const productoId = producto.idProducto;
        const esFavorito = estadosFavoritos[productoId] || false;
        const cargando = cargandoFavoritos[productoId] || false;
        const imagenProducto = obtenerImagenProducto(producto);

        return (
            <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-4"
                id={`home-${tipo}-card-${index + 1}`}>
                <div className="card text-center h-100 home-product-card position-relative"
                    id={`home-${tipo}-card-container-${index + 1}`}>

                    {/* BOTÓN DE FAVORITOS */}
                    {userData?.rol === 1 && (
                        <button
                            className="btn btn-link text-decoration-none position-absolute top-0 end-0 p-3"
                            onClick={() => handleFavoritoClick(producto)}
                            disabled={cargando || loadingFavoritosGlobal}
                            aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                            style={{ zIndex: 2 }}
                            id={`home-${tipo}-favorite-btn-${index + 1}`}
                            title={!isAuthenticated ? "Inicia sesión para agregar a favoritos" : (esFavorito ? "Quitar de favoritos" : "Agregar a favoritos")}
                        >
                            {cargando ? (
                                <div className="spinner-border spinner-border-sm text-danger" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            ) : (
                                <i className={`bi ${esFavorito ? 'bi-heart-fill text-danger' : 'bi-heart text-white'}`}
                                    style={{
                                        fontSize: '1.5rem',
                                        filter: esFavorito ? 'none' : 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))',
                                        opacity: !isAuthenticated ? 0.5 : 1
                                    }}></i>
                            )}
                        </button>
                    )}

                    {/* IMAGEN DEL PRODUCTO */}
                    <div className="producto-imagen-container-home" id={`home-${tipo}-image-container-${index + 1}`}>
                        <Link to={`/home/${producto.codigoReferencia}`} className="d-block">
                            <img
                                src={imagenProducto}
                                className="card-img-top home-product-image"
                                alt={producto.nombreProducto}
                                id={`home-${tipo}-image-${index + 1}`}
                                onError={(e) => {
                                    e.target.src = "/imagenes_prueba/default.jpg";
                                }}
                            />
                        </Link>
                    </div>

                    <div className="card-body home-product-body" id={`home-${tipo}-card-body-${index + 1}`}>
                        <h5 className="card-title home-product-title" id={`home-${tipo}-title-${index + 1}`}>
                            {producto.nombreProducto}
                        </h5>
                        <p className="card-text home-product-description" id={`home-${tipo}-description-${index + 1}`}>
                            {producto.nombrePublico} - {producto.nombreTipoProducto}
                        </p>

                        <div className="home-product-hover-text" id={`home-${tipo}-hover-text-${index + 1}`}>
                            <p id={`home-${tipo}-hover-price-${index + 1}`}>
                                ${producto.precio?.toLocaleString() || 'N/A'}
                            </p>
                        </div>

                        {/* BOTÓN DE VER DETALLES */}
                        <div className="mt-3">
                            <Link
                                to={`/home/${producto.codigoReferencia}`}
                                className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                id={`home-${tipo}-details-btn-${index + 1}`}
                            >
                                <i className="bi bi-eye"></i>
                                <span>Ver detalles</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ========== RENDERIZADO ==========
    if (loading) {
        return (
            <div className="allHome" id="home-container">
                <MenuHome />
                <div className="body-color" id="home-body">
                    <div className="container text-center text-white py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3">Cargando productos...</p>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="allHome" id="home-container">
                <MenuHome />
                <div className="body-color" id="home-body">
                    <div className="container text-center text-white py-5">
                        <p>Error al cargar productos: {error}</p>
                        <button onClick={() => window.location.reload()} className="btn btn-light mt-3">
                            Reintentar
                        </button>
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="allHome" id="home-container">
            <MenuHome />
            <div className="body-color" id="home-body">

                {/* SECCIÓN DE BANNERS */}
                <div className="container-fluid mt-0 p-0">
                    {loadingBanners ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Cargando banners...</span>
                            </div>
                            <p className="text-white mt-2">Cargando banners promocionales...</p>
                        </div>
                    ) : bannerError ? (
                        <div className="alert alert-warning text-center m-3">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {bannerError}
                        </div>
                    ) : banners.length > 0 ? (
                        <BannerCarousel banners={banners} />
                    ) : (
                        <div className="alert alert-info text-center m-3">
                            <i className="bi bi-info-circle me-2"></i>
                            No hay banners para mostrar
                        </div>
                    )}
                </div>
        
                {/* BANNER DE FAVORITOS */}
                {userData?.rol === 1 && isAuthenticated && (
                    <div className="container-fluid py-3 bg-dark bg-opacity-50">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <h5 className="text-white mb-0">
                                        <i className="bi bi-heart-fill text-danger me-2"></i>
                                        Tus productos favoritos
                                    </h5>
                                    <small className="text-white-50">
                                        Tienes {contadorFavoritos} {contadorFavoritos === 1 ? 'producto' : 'productos'} guardados
                                    </small>
                                </div>
                                <div className="col-md-6 text-end">
                                    <Link to="/favoritos" className="btn btn-outline-light btn-sm">
                                        <i className="bi bi-heart me-2"></i>
                                        Ver todos mis favoritos
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="container-fluid" id="home-products-container">

                    {/* SECCIÓN: ZAPATOS */}
                    <div className="row mt-5" id="home-shoes-section">
                        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
                            <h1 className="text-white mb-0" id="home-shoes-title">
                                Compra por estilos de calzado
                            </h1>
                            <Link to="/catalogo" className="btn btn-outline-light btn-sm">
                                Ver más <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                        </div>

                        {zapatos.length > 0 ? (
                            zapatos.map((zapato, index) => (
                                <ProductoCard
                                    key={zapato.codigoReferencia || index}
                                    producto={zapato}
                                    tipo="shoe"
                                    index={index}
                                />
                            ))
                        ) : (
                            !loading && (
                                <div className="col-12">
                                    <div className="alert alert-info text-center">
                                        <i className="bi bi-info-circle me-2"></i>
                                        No hay zapatos disponibles en este momento
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* SECCIÓN: BOLSOS */}
                    <div className="row mt-5" id="home-bags-section">
                        <div className="col-12 d-flex justify-content-between align-items-center mb-4">
                            <h1 className="text-white mb-0" id="home-bags-title">
                                Compra por estilos de bolsos
                            </h1>
                            <Link to="/catalogo" className="btn btn-outline-light btn-sm">
                                Ver más <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                        </div>

                        {bolsos.length > 0 ? (
                            bolsos.map((bolso, index) => (
                                <ProductoCard
                                    key={bolso.codigoReferencia || index}
                                    producto={bolso}
                                    tipo="bag"
                                    index={index}
                                />
                            ))
                        ) : (
                            !loading && (
                                <div className="col-12">
                                    <div className="alert alert-info text-center">
                                        <i className="bi bi-info-circle me-2"></i>
                                        No hay bolsos disponibles en este momento
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* CALL TO ACTION PARA FAVORITOS */}
                    {userData?.rol === 1 && isAuthenticated && (
                        <div className="row mt-5 mb-5">
                            <div className="col-12">
                                <div className="card bg-dark text-center border-light">
                                    <div className="card-body py-4">
                                        <i className="bi bi-heart-fill text-danger display-4 mb-3"></i>
                                        <h3 className="card-title text-white">Guarda tus productos favoritos</h3>
                                        <p className="card-text text-white-50">
                                            Agrega productos a tu lista de favoritos para acceder rápidamente a ellos más tarde.
                                        </p>
                                        <Link to="/favoritos" className="btn btn-danger btn-lg mt-3">
                                            <i className="bi bi-heart me-2"></i>
                                            Ver mis favoritos ({contadorFavoritos})
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}