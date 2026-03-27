// src/pages/FavoritosPage.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuHome from "../../layouts/home/menuHome";
import Footer from "../../layouts/home/footer";
import { useFavoritos } from "../../hooks/favorito/useFavorito";
import useAuth from "../../hooks/token/useAuth";
import { useGetStock } from "../../hooks/stock/useGetStock";
import { getImagenById } from "../../services/administrador/ImagenService.js";
import { useResponsive } from "../../hooks/responsive/responsive";
import "../../styles/home/favoritos.css";

// URL base para imágenes
const BASE_URL = "http://35.171.131.177:8080";

const FavoritosPage = () => {
  const navigate = useNavigate();
  const { stock } = useGetStock();
  const { isMobile } = useResponsive();
  
  const { isAuthenticated, userData } = useAuth();
  const userId = userData?.idUsuario;
  
  console.log('Favoritos - isAuthenticated:', isAuthenticated);
  console.log('Favoritos - userData:', userData);
  console.log('Favoritos - userId:', userId);
  
  const { 
    obtenerProductosFavoritos,
    eliminarFavorito,
    eliminarTodosFavoritos,
    verificarProductoEnFavoritos,
    contarFavoritosUsuario,
    loading: loadingFavoritos,
    error,
    limpiarError
  } = useFavoritos();
  
  const [productosFavoritos, setProductosFavoritos] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});
  const [contador, setContador] = useState(0);
  const [eliminandoTodos, setEliminandoTodos] = useState(false);

  // ============================
  // 1. CARGAR PRODUCTOS FAVORITOS
  // ============================
  useEffect(() => {
    const cargarFavoritos = async () => {
      if (!isAuthenticated || !userId) {
        setProductosFavoritos([]);
        setContador(0);
        return;
      }
      
      try {
        const productos = await obtenerProductosFavoritos(userId);
        setProductosFavoritos(productos);
        setContador(productos.length);
        
        // Cargar imágenes para cada producto
        const imagenes = {};
        for (const producto of productos) {
          if (producto.idProducto) {
            try {
              const response = await getImagenById(producto.idProducto);
              if (response.data && response.data.length > 0) {
                const urlImagen = response.data[0].urlImagen.startsWith('/') 
                  ? response.data[0].urlImagen 
                  : `/${response.data[0].urlImagen}`;
                imagenes[producto.idProducto] = `${BASE_URL}${urlImagen}`;
              } else {
                const productoStock = stock.find(p => p.idProducto === producto.idProducto);
                imagenes[producto.idProducto] = productoStock?.imagen || "/imagenes_prueba/default.jpg";
              }
            } catch (imgError) {
              console.error(`Error cargando imagen para producto ${producto.idProducto}:`, imgError);
              imagenes[producto.idProducto] = "/imagenes_prueba/default.jpg";
            }
          }
        }
        setImagenesProductos(imagenes);
        
      } catch (err) {
        console.error("Error cargando favoritos:", err);
        setProductosFavoritos([]);
        setContador(0);
      }
    };
    
    cargarFavoritos();
  }, [isAuthenticated, userId, obtenerProductosFavoritos, stock]);

  // ============================
  // 2. ACTUALIZAR CONTADOR PERIÓDICAMENTE
  // ============================
  useEffect(() => {
    const actualizarContador = async () => {
      if (!isAuthenticated || !userId) return;
      
      try {
        const cantidad = await contarFavoritosUsuario(userId);
        setContador(cantidad);
      } catch (error) {
        console.error("Error actualizando contador:", error);
      }
    };
    
    actualizarContador();
    const interval = setInterval(actualizarContador, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, userId, contarFavoritosUsuario]);

  // ============================
  // 3. ELIMINAR UN FAVORITO
  // ============================
  const handleEliminarFavorito = async (idProducto) => {
    if (!isAuthenticated || !userId || !idProducto) return;
    
    try {
      await eliminarFavorito(userId, idProducto);
      
      const sigueSiendoFavorito = await verificarProductoEnFavoritos(userId, idProducto);
      
      if (!sigueSiendoFavorito) {
        setProductosFavoritos(prev => prev.filter(p => p.idProducto !== idProducto));
        setContador(prev => Math.max(0, prev - 1));
        console.log("Producto eliminado de favoritos");
      }
    } catch (err) {
      console.error("Error eliminando favorito:", err);
      alert("Error al eliminar de favoritos. Por favor intenta nuevamente.");
    }
  };

  // ============================
  // 4. ELIMINAR TODOS LOS FAVORITOS
  // ============================
  const handleEliminarTodos = async () => {
    if (!isAuthenticated || !userId) return;
    
    if (!window.confirm("¿Estás seguro de que deseas eliminar todos los productos de favoritos?")) {
      return;
    }
    
    try {
      setEliminandoTodos(true);
      await eliminarTodosFavoritos(userId);
      
      const nuevaCantidad = await contarFavoritosUsuario(userId);
      
      if (nuevaCantidad === 0) {
        setProductosFavoritos([]);
        setContador(0);
        alert("Todos los productos han sido eliminados de favoritos");
      } else {
        alert("Hubo un problema al eliminar algunos productos. Por favor intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error eliminando todos los favoritos:", err);
      alert("Error al eliminar todos los favoritos");
    } finally {
      setEliminandoTodos(false);
    }
  };

  // ============================
  // 5. OBTENER IMAGEN DEL PRODUCTO
  // ============================
  const obtenerImagenProducto = (producto) => {
    if (producto.idProducto && imagenesProductos[producto.idProducto]) {
      return imagenesProductos[producto.idProducto];
    }
    
    const productoStock = stock.find(p => p.idProducto === producto.idProducto);
    return productoStock?.imagen || producto.imagen || "/imagenes_prueba/default.jpg";
  };

  // ============================
  // 6. OBTENER URL DEL PRODUCTO (según dispositivo)
  // ============================
  const obtenerUrlProducto = (producto) => {
    const productoStock = stock.find(p => p.idProducto === producto.idProducto);
    
    if (productoStock?.codigoReferencia) {
      return `/home/${productoStock.codigoReferencia}`;
    }
    
    return `/producto/${producto.idProducto}`;
  };

  // ============================
  // 7. FUNCIÓN PARA NAVEGAR AL CATÁLOGO (según dispositivo)
  // ============================
  const handleIrCatalogo = () => {
    if (isMobile) {
      navigate("/home/catalogo");
    } else {
      navigate("/Catalogo");
    }
  };

  const handleIrInicio = () => {
    navigate("/");
  };

  // ============================
  // 8. RENDERIZADO PARA NO AUTENTICADO
  // ============================
  if (!isAuthenticated) {
    return (
      <div className="favoritos-container">
        <MenuHome />
        <div className="container text-center py-5 mt-5">
          <div className="card border-0 shadow-sm bg-dark text-white">
            <div className="card-body py-5">
              <i className="bi bi-heart text-danger display-1 mb-4"></i>
              <h2 className="card-title">Acceso no autorizado</h2>
              <p className="card-text mt-3">
                Por favor inicia sesión para ver y gestionar tus productos favoritos.
              </p>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/loginpage')}
                  className="btn btn-danger btn-lg me-3"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => navigate('/registrarUsuarios')}
                  className="btn btn-outline-light btn-lg"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================
  // 9. RENDERIZADO DE CARGA
  // ============================
  if (loadingFavoritos) {
    return (
      <div className="favoritos-container">
        <MenuHome />
        <div className="container text-center py-5 mt-5">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div>
              <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-white">Cargando tus productos favoritos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================
  // 10. RENDERIZADO DE ERROR
  // ============================
  if (error) {
    return (
      <div className="favoritos-container">
        <MenuHome />
        <div className="container py-5 mt-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Error
            </h4>
            <p>{error}</p>
            <div className="mt-3">
              <button onClick={limpiarError} className="btn btn-outline-danger me-2">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reintentar
              </button>
              <button onClick={handleIrCatalogo} className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al catálogo
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="favoritos-container">
      <MenuHome />
      
      <div className="container py-5">
        {/* HEADER */}
        <div className="row mb-4">
          <div className="col-md-8">
            <h1 className="favoritos-title text-white">
              <i className="bi bi-heart-fill text-danger me-2"></i>
              Mis Productos Favoritos
            </h1>
            <p className="text-white-50">
              {contador} {contador === 1 ? 'producto guardado' : 'productos guardados'}
            </p>
          </div>
          
          <div className="col-md-4 text-end">
            {productosFavoritos.length > 0 && (
              <button 
                onClick={handleEliminarTodos}
                className="btn btn-outline-danger"
                disabled={eliminandoTodos || loadingFavoritos}
              >
                {eliminandoTodos ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Eliminando...</span>
                    </div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Eliminar Todos
                  </>
                )}
              </button>
            )}
            
            <button 
              onClick={handleIrCatalogo}
              className="btn btn-outline-light ms-2"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Seguir Comprando
            </button>
          </div>
        </div>

        {/* LISTA DE FAVORITOS */}
        {productosFavoritos.length === 0 ? (
          <div className="text-center py-5 mt-4">
            <div className="card bg-dark bg-opacity-50 border-light">
              <div className="card-body py-5">
                <i className="bi bi-heart text-muted" style={{ fontSize: '5rem' }}></i>
                <h3 className="mt-4 text-white">No tienes productos favoritos</h3>
                <p className="text-white-50 mt-2">
                  Agrega productos a tus favoritos haciendo clic en el corazón
                </p>
                <div className="mt-4">
                  <button 
                    onClick={handleIrCatalogo}
                    className="btn btn-danger btn-lg me-3"
                  >
                    <i className="bi bi-bag me-2"></i>
                    Explorar Catálogo
                  </button>
                  <button 
                    onClick={handleIrInicio}
                    className="btn btn-outline-light btn-lg"
                  >
                    <i className="bi bi-house me-2"></i>
                    Volver al inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {productosFavoritos.map((producto, index) => (
              <div key={producto.idProducto || index} className="col-md-6 col-lg-4 col-xl-3 mb-4">
                <div className="card favorito-card h-100">
                  <div className="position-relative">
                    <Link to={obtenerUrlProducto(producto)} className="d-block">
                      <img 
                        src={obtenerImagenProducto(producto)} 
                        className="card-img-top favorito-imagen"
                        alt={producto.nombre || producto.nombreProducto}
                        onError={(e) => {
                          e.target.src = "/imagenes_prueba/default.jpg";
                        }}
                      />
                    </Link>
                    
                    <button
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                      onClick={() => handleEliminarFavorito(producto.idProducto)}
                      title="Eliminar de favoritos"
                      disabled={loadingFavoritos}
                      style={{ width: '36px', height: '36px' }}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                  
                  <div className="card-body">
                    <h5 className="card-title favorito-nombre">
                      {producto.nombre || producto.nombreProducto || 'Producto sin nombre'}
                    </h5>
                    
                    {producto.descripcion && (
                      <p className="card-text text-muted small favorito-descripcion">
                        {producto.descripcion.length > 100 
                          ? `${producto.descripcion.substring(0, 100)}...` 
                          : producto.descripcion}
                      </p>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="h5 mb-0 text-primary favorito-precio">
                        ${producto.precio?.toLocaleString() || '0'}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      {producto.nombreCategoria && (
                        <small className="badge bg-secondary me-1">
                          {producto.nombreCategoria}
                        </small>
                      )}
                      
                      {producto.nombreTipoProducto && (
                        <small className="badge bg-info me-1">
                          {producto.nombreTipoProducto}
                        </small>
                      )}
                      
                      {producto.nombrePublico && (
                        <small className="badge bg-warning text-dark">
                          {producto.nombrePublico}
                        </small>
                      )}
                    </div>
                    
                    {producto.fechaAgregado && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          Agregado: {new Date(producto.fechaAgregado).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE DE PÁGINA */}
        {productosFavoritos.length > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card bg-dark border-light">
                <div className="card-body text-center py-4">
                  <h5 className="text-white">
                    <i className="bi bi-info-circle me-2 text-info"></i>
                    Información de tus favoritos
                  </h5>
                  <p className="text-white-50 mb-0">
                    Los productos se mantendrán en tu lista de favoritos hasta que los elimines.
                    Puedes agregar hasta 50 productos como máximo.
                  </p>
                  <div className="mt-3">
                    <small className="text-white-50">
                      <i className="bi bi-clock me-1"></i>
                      Última actualización: {new Date().toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default FavoritosPage;