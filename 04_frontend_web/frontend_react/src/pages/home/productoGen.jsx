// pages/home/productoGen.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetStock } from "../../hooks/stock/useGetStock";
import MenuHome from "../../layouts/home/menuHome";
import "../../styles/home/productGen.css";
import "../../styles/administrador/inventario.css";
import "../../styles/administrador/gestion_producto.css";
import api_url from "../../services/administrador/api";
import { getImagenById } from "../../services/administrador/ImagenService.js";
import { useFavoritos } from "../../hooks/favorito/useFavorito";
import useAuth from "../../hooks/token/useAuth";
import { getStockByProducto, deleteStock } from "../../services/administrador/StockService";

const ProductoGen = () => {
  const { stock } = useGetStock();
  const { codigoReferencia, idProducto } = useParams();
  const navigate = useNavigate();
  
  // Usa tu hook useAuth
  const { isAuthenticated, userData } = useAuth();
  const userId = userData?.idUsuario;
  
  console.log('ProductoGen - isAuthenticated:', isAuthenticated);
  console.log('ProductoGen - userData:', userData);
  console.log('ProductoGen - userId:', userId);
  
  // Usar hook de favoritos
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

  // ============================
  // 1️⃣ Cargar COLORES del producto
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
  // 2️⃣ Cargar IMÁGENES del producto
  // ============================
  useEffect(() => {
    if (!producto) return;

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
  // 4️⃣ Cargar stock específico cuando se tiene idProducto
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
  // 5️⃣ VERIFICAR SI EL PRODUCTO ES FAVORITO
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

  // ============================
  // 6️⃣ MANEJAR CLIC EN BOTÓN DE FAVORITOS
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
  // 7️⃣ Función para eliminar stock (solo si estamos en modo admin)
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
  // 8️⃣ Manejar cambios en cantidad (SIN VERIFICACIÓN DE STOCK)
  // ============================
  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value);
    
    if (value < 1) {
      setCantidad(1);
    } else {
      setCantidad(value);
    }
  };

  const incrementarCantidad = () => {
    setCantidad(cantidad + 1);
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  // ============================
  // 9️⃣ Función para manejar compra
  // ============================
  const handleComprar = () => {
    if (!colorSeleccionado || !tallaSeleccionada) {
      alert("Por favor selecciona color y talla");
      return;
    }

    // Aquí iría la lógica para agregar al carrito o procesar la compra
    console.log("Comprar:", {
      producto: producto.nombreProducto,
      color: colorSeleccionado,
      talla: tallaSeleccionada,
      cantidad: cantidad,
      precioTotal: producto.precio * cantidad
    });

    alert(`¡Agregado al carrito! ${cantidad} unidad(es) de ${producto.nombreProducto}`);
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

  if (!producto) {
    return <h2 className="text-center mt-5" id="producto-no-encontrado">Producto no encontrado</h2>;
  }

  // Verificar si estamos en modo administrador (si hay idProducto en params)
  const esModoAdmin = !!idProducto;
  
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
                        onChange={(e) => setColorSeleccionado(e.target.value)}
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
                        onChange={(e) => setTallaSeleccionada(e.target.value)}
                        disabled={!colorSeleccionado}
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

                  {/* SELECTOR DE CANTIDAD (SIN VERIFICACIÓN DE STOCK) */}
                  <div className="row producto-cantidad-fila mt-4" id="producto-cantidad-fila">
                    <div className="col-md-6 offset-md-3">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Cantidad</h5>
                          <div className="d-flex align-items-center justify-content-center">
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={decrementarCantidad}
                              disabled={cantidad <= 1}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            
                            <input 
                              type="number" 
                              min="1"
                              value={cantidad}
                              onChange={handleCantidadChange}
                              className="form-control text-center mx-3"
                              style={{ maxWidth: '80px' }}
                            />
                            
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={incrementarCantidad}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                          <div className="mt-2 text-center">
                            <small className="text-muted">
                              Cantidad seleccionada: {cantidad} unidad(es)
                            </small>
                            <br />
                            <small className="text-success">
                              Precio total: ${(producto.precio * cantidad).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN */}
                  <div className="row producto-botones-fila justify-content-center mt-4" id="producto-botones-fila">
                    <div className="col-auto" id="producto-boton-favorito-col">
                      {renderBotonFavorito()}
                    </div>

                    <div className="col-auto" id="producto-boton-comprar-col">
                      <button 
                        className="btn producto-btn-comprar btn-success"
                        id="producto-btn-comprar"
                        onClick={handleComprar}
                        disabled={!colorSeleccionado || !tallaSeleccionada}
                        title={!colorSeleccionado || !tallaSeleccionada ? "Selecciona color y talla" : ""}
                      >
                        <i className="bi bi-cart-plus producto-icono-comprar me-2" id="producto-icono-comprar"></i>
                        Comprar
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

                  {/* SECCIÓN COMENTARIOS */}
                  <div className="row producto-comentarios-fila mt-5" id="producto-comentarios-fila">
                    <div className="col-12" id="producto-comentarios-col">
                      <div className="producto-seccion-comentarios" id="producto-seccion-comentarios">
                        <h2 className="producto-titulo-comentarios text-center mb-4" id="producto-titulo-comentarios">
                          <i className="bi bi-chat-dots me-2" id="producto-icono-comentarios"></i>
                          Opiniones del producto
                        </h2>
                        
                        <form className="producto-form-comentario container" id="producto-form-comentario">
                          <div className="row align-items-end" id="producto-form-comentario-row">
                            <div className="col-md-8" id="producto-input-comentario-col">
                              <label className="form-label producto-label-comentario" id="producto-label-comentario">Deja tu opinión</label>
                              <input 
                                type="text" 
                                name="opinion"
                                placeholder="Comparte tu experiencia con este producto..."
                                className="form-control producto-input-comentario"
                                id="producto-input-comentario"
                              />
                            </div>
                            <div className="col-md-4" id="producto-boton-comentario-col">
                              <button 
                                type="submit" 
                                className="btn producto-btn-enviar-comentario btn-outline-primary w-100"
                                id="producto-btn-enviar-comentario"
                              >
                                <i className="bi bi-send producto-icono-comentar me-2" id="producto-icono-comentar"></i>
                                Publicar comentario
                              </button>
                            </div>
                          </div>
                        </form>

                        <div className="producto-lista-comentarios mt-4" id="producto-lista-comentarios">
                          <p className="text-muted text-center" id="producto-sin-comentarios-message">
                            <i className="bi bi-info-circle me-2" id="producto-icono-sin-comentarios"></i>
                            Sé el primero en comentar este producto
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

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