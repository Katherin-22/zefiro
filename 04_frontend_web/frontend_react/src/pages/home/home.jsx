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
  const hasLogged = useRef(false);
  const hasFetchedBanners = useRef(false);
  const hasFetchedFavoritos = useRef(false);
  const hasFetchedContador = useRef(false);
  const hasFetchedProductos = useRef(false);
  // ========================================

  // ========== DEBUG INICIAL (SOLO UNA VEZ) ==========
  if (!hasLogged.current) {
    console.log("=== 🏠 HOME.JSX INICIADO ===");
    console.log("📅 Hora:", new Date().toISOString());
    hasLogged.current = true;
  }
  // ==================================================

  const { stock, loading, error } = useGetStock();
  const navigate = useNavigate();

  // Estados para los banners
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true); // Iniciar como true
  const [bannerError, setBannerError] = useState("");

  // Usa tu hook useAuth
  const { isAuthenticated, userData , isLoading  } = useAuth();

  const userId = userData?.idUsuario;
  // Log de autenticación (solo cuando cambien)
  useEffect(() => {
    console.log('Home - isAuthenticated:', isAuthenticated);
    console.log('Home - userData:', userData);
    console.log('Home - userId:', userData?.idUsuario);
  }, [isAuthenticated, userData]);

  const [zapatos, setZapatos] = useState([]);
  const [bolsos, setBolsos] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});

  // Estados para favoritos
  const [estadosFavoritos, setEstadosFavoritos] = useState({});
  const [cargandoFavoritos, setCargandoFavoritos] = useState({});
  const [contadorFavoritos, setContadorFavoritos] = useState(0);

  // Hooks
  const {
    agregarFavorito,
    eliminarFavorito,
    verificarProductoEnFavoritos,
    contarFavoritosUsuario,
    loading: loadingFavoritosGlobal
  } = useFavoritos();

  // ============================
  // CARGAR BANNERS - VERSIÓN CORREGIDA
  // ============================
  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (hasFetchedBanners.current) return;
    hasFetchedBanners.current = true;

    console.log("🔄 Iniciando carga de banners...");
    setLoadingBanners(true);

    const fetchBanners = async () => {
      try {
        console.log('🔄 Intentando cargar banners...');

        // Opción 1: Endpoint principal
        const response = await fetch('http://localhost:8080/api/banners');

        console.log('📡 Respuesta banners - Status:', response.status);

        if (!response.ok) {
          if (response.status === 403) {
            console.log('❌ Acceso prohibido a banners - probando endpoint público');

            // Opción 2: Intentar con endpoint público
            try {
              const publicResponse = await fetch('http://localhost:8080/api/banners/public');

              if (publicResponse.ok) {
                const publicData = await publicResponse.json();
                console.log('✅ Banners públicos cargados:', publicData);
                setBanners(publicData);
                setBannerError("");
              } else {
                throw new Error(`Endpoint público respondió con ${publicResponse.status}`);
              }
            } catch (publicError) {
              console.log('❌ Endpoint público falló:', publicError.message);

              // Opción 3: Datos mock como fallback
              console.log('🔄 Usando datos mock de banners');
              const mockBanners = [
                {
                  id: 1,
                  titulo: 'Bienvenido a Zefiro',
                  imagen: 'https://via.placeholder.com/1920x600/3498db/ffffff?text=Zefiro',
                  urlDestino: '/catalogo',
                  activo: true
                },
                {
                  id: 2,
                  titulo: 'Nueva Colección',
                  imagen: 'https://via.placeholder.com/1920x600/e74c3c/ffffff?text=Nueva+Colección',
                  urlDestino: '/catalogo',
                  activo: true
                },
                {
                  id: 3,
                  titulo: 'Ofertas Especiales',
                  imagen: 'https://via.placeholder.com/1920x600/2ecc71/ffffff?text=Ofertas',
                  urlDestino: '/catalogo',
                  activo: true
                }
              ];
              setBanners(mockBanners);
              setBannerError("Usando banners de ejemplo - El servidor no responde");
            }
          } else {
            throw new Error(`Error HTTP ${response.status}`);
          }
        } else {
          const data = await response.json();
          console.log('✅ Banners cargados:', data);
          setBanners(data);
          setBannerError("");
        }
      } catch (error) {
        console.error('❌ Error cargando banners:', error);
        setBannerError("Error al cargar banners promocionales");

        // Fallback con datos mock
        setBanners([
          {
            id: 1,
            titulo: 'Bienvenido a Zefiro',
            imagen: 'https://via.placeholder.com/1920x600/3498db/ffffff?text=Zefiro',
            urlDestino: '/catalogo',
            activo: true
          }
        ]);
      } finally {
        setLoadingBanners(false);
        console.log("🏁 Carga de banners completada");
      }
    };

    fetchBanners();
  }, []); // Dependencias vacías - solo se ejecuta UNA VEZ

  // ============================
  // 1. CARGAR CONTADOR DE FAVORITOS
  // ============================
  useEffect(() => {
    if (hasFetchedContador.current) return;

    const cargarContadorFavoritos = async () => {
      if (!userId) {
        setContadorFavoritos(0);
        return;
      }

      try {
        const cantidad = await contarFavoritosUsuario(userId);
        setContadorFavoritos(cantidad);
        hasFetchedContador.current = true;
      } catch (error) {
        console.error("Error cargando contador de favoritos:", error);
      }
    };

    cargarContadorFavoritos();
  }, [userId, contarFavoritosUsuario]);

  // ============================
  // 2. VERIFICAR FAVORITOS DE TODOS LOS PRODUCTOS
  // ============================
  useEffect(() => {
    if (hasFetchedFavoritos.current || !stock.length) return;

    const verificarFavoritosProductos = async () => {
      if (!userId || !stock.length) {
        // Inicializar todos como false si no hay usuario
        const iniciales = {};
        stock.forEach(producto => {
          if (producto.idProducto) {
            iniciales[producto.idProducto] = false;
          }
        });
        setEstadosFavoritos(iniciales);
        return;
      }

      const nuevosEstados = {};
      const nuevoCargando = {};

      // Inicializar estados
      stock.forEach(producto => {
        if (producto.idProducto) {
          nuevosEstados[producto.idProducto] = false;
          nuevoCargando[producto.idProducto] = true;
        }
      });

      setEstadosFavoritos(nuevosEstados);
      setCargandoFavoritos(nuevoCargando);

      // Verificar cada producto
      for (const producto of stock) {
        if (!producto.idProducto) continue;

        try {
          const esFavorito = await verificarProductoEnFavoritos(userId, producto.idProducto);

          setEstadosFavoritos(prev => ({
            ...prev,
            [producto.idProducto]: esFavorito
          }));
        } catch (error) {
          console.error(`Error verificando favorito del producto ${producto.idProducto}:`, error);
        } finally {
          setCargandoFavoritos(prev => ({
            ...prev,
            [producto.idProducto]: false
          }));
        }
      }

      hasFetchedFavoritos.current = true;
    };

    verificarFavoritosProductos();
  }, [userId, stock, verificarProductoEnFavoritos]);

  // ============================
  // 3. FILTRAR PRODUCTOS Y CARGAR IMÁGENES
  // ============================
  useEffect(() => {
    if (hasFetchedProductos.current || !stock || !stock.length) return;

    const filtrarYCargarImagenes = async () => {
      if (stock && stock.length > 0) {
        // Filtrar zapatos
        const zapatosFiltrados = stock.filter(producto => {
          const tipo = producto.nombreTipoProducto?.toLowerCase() || '';
          const nombre = producto.nombreProducto?.toLowerCase() || '';

          const esZapato = tipo.includes('zapato') ||
            tipo.includes('calzado') ||
            nombre.includes('zapato') ||
            nombre.includes('tenis') ||
            nombre.includes('deportivo');

          return esZapato;
        }).slice(0, 4);

        // Filtrar bolsos
        const bolsosFiltrados = stock.filter(producto => {
          const tipo = producto.nombreTipoProducto?.toLowerCase() || '';
          const nombre = producto.nombreProducto?.toLowerCase() || '';

          const esBolso = tipo.includes('bolso') ||
            nombre.includes('bolso') ||
            nombre.includes('mochila') ||
            nombre.includes('cartera');

          return esBolso;
        }).slice(0, 4);

        // Cargar imágenes para todos los productos
        const todasImagenes = {};

        // Cargar imágenes de zapatos
        for (const zapato of zapatosFiltrados) {
          if (zapato.idProducto && !todasImagenes[zapato.idProducto]) {
            const imagenUrl = await cargarImagenProducto(zapato.idProducto);
            todasImagenes[zapato.idProducto] = imagenUrl || zapato.imagen || "/imagenes_prueba/default.jpg";
          }
        }

        // Cargar imágenes de bolsos
        for (const bolso of bolsosFiltrados) {
          if (bolso.idProducto && !todasImagenes[bolso.idProducto]) {
            const imagenUrl = await cargarImagenProducto(bolso.idProducto);
            todasImagenes[bolso.idProducto] = imagenUrl || bolso.imagen || "/imagenes_prueba/default.jpg";
          }
        }

        setImagenesProductos(todasImagenes);
        setZapatos(zapatosFiltrados);
        setBolsos(bolsosFiltrados);
        hasFetchedProductos.current = true;
      } else {
        setZapatos([]);
        setBolsos([]);
        setImagenesProductos({});
      }
    };

    filtrarYCargarImagenes();
  }, [stock]);

  // Función para cargar imágenes de un producto
  const cargarImagenProducto = async (idProducto) => {
    try {
      const response = await getImagenById(idProducto);
      if (response.data && response.data.length > 0) {
        return `http://localhost:8080${response.data[0].urlImagen}`;
      }
      return null;
    } catch (error) {
      console.error("Error al cargar imagen del producto:", error);
      return null;
    }
  };

  const handleAddToCart = async (productoStock) => {

    navigate(`/home/${productoStock.codigoReferencia}`);

  };

  // ============================
  // MANEJAR CLIC EN CORAZÓN
  // ============================
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
      // Marcar como cargando
      setCargandoFavoritos(prev => ({
        ...prev,
        [productoId]: true
      }));

      if (esFavoritoActual) {
        // Eliminar de favoritos
        await eliminarFavorito(userId, productoId);
        setEstadosFavoritos(prev => ({
          ...prev,
          [productoId]: false
        }));
        setContadorFavoritos(prev => Math.max(0, prev - 1));
      } else {
        // Agregar a favoritos
        const requestData = { idProducto: productoId };
        await agregarFavorito(userId, requestData);
        setEstadosFavoritos(prev => ({
          ...prev,
          [productoId]: true
        }));
        setContadorFavoritos(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error al cambiar estado de favorito:", error);
      alert(error.message || "Error al actualizar favoritos");
    } finally {
      setCargandoFavoritos(prev => ({
        ...prev,
        [productoId]: false
      }));
    }
  };

  // Función para obtener la imagen de un producto
  const obtenerImagenProducto = (producto) => {
    if (producto.idProducto && imagenesProductos[producto.idProducto]) {
      return imagenesProductos[producto.idProducto];
    }
    return producto.imagen || "/imagenes_prueba/default.jpg";
  };

  // Componente de tarjeta de producto
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

            <button
              className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => handleAddToCart(producto)}
              id={`home-${tipo}-cart-btn-${index + 1}`}
            >
              <i className="bi bi-cart-plus"></i>
              <span>Agregar al carrito</span>
            </button>

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

  // Estados de carga y error
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

  if (isLoading) {
  return (
    <div className="allHome" style={{ backgroundColor: '#121212', height: '100vh' }}>
      <div className="container h-100 d-flex flex-column justify-content-center align-items-center text-white">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <h4 className="mt-4">Verificando sesión...</h4>
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

        {/* SECCIÓN DE BANNERS (CARRUSEL) */}
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
        {isAuthenticated && (
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
          {isAuthenticated && (
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

        <Footer />
      </div>
    </div>
  );
}