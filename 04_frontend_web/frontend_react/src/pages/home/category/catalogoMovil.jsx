import React, { useState, useEffect } from "react";
import { useGetStock } from "../../../hooks/stock/useGetStock";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuHome from "../../../layouts/home/menuHome";
import { useFiltro } from "../../../utils/FiltroContextx.jsx";
import { getImagenById } from "../../../services/administrador/ImagenService.js";
import { useResponsive } from "../../../hooks/responsive/responsive";
import "../../../styles/home/canalogoHome.css";
import "../../../styles/home/catalogoMobile.css";
import api_url from "../../../services/administrador/api.js";

const CatalogoMobile = () => {
  const { stock } = useGetStock();
  const { filtro, setFiltro } = useFiltro();
  const { isMobile } = useResponsive();
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados para filtros avanzados
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    precioMin: "",
    precioMax: "",
    marca: "",
    material: "",
    publico: "",
    tipoBolso: ""
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoProductoActual, setTipoProductoActual] = useState('todos');

  // Estados para opciones de filtros
  const [marcasUnicas, setMarcasUnicas] = useState([]);
  const [materialesUnicos, setMaterialesUnicos] = useState([]);
  const [publicosUnicos, setPublicosUnicos] = useState([]);
  const [cargandoFiltros, setCargandoFiltros] = useState(true);

  // Función para extraer marca del producto (primera palabra del nombre como fallback)
  const extraerMarca = (producto) => {
    if (!producto) return null;
    if (producto.nombreMarca) return producto.nombreMarca;
    if (producto.nombreProducto) {
      const primeraPalabra = producto.nombreProducto.split(' ')[0];
      return primeraPalabra;
    }
    return null;
  };

  // Obtener valores únicos de los productos
  useEffect(() => {
    if (!stock || stock.length === 0) {
      setCargandoFiltros(false);
      return;
    }
    
    setCargandoFiltros(true);
    
    const marcasSet = new Set();
    const materialesSet = new Set();
    const publicosSet = new Set();
    
    // Procesar cada producto del stock
    for (const producto of stock) {
      // Marca
      const marca = extraerMarca(producto);
      if (marca) {
        marcasSet.add(marca);
      }
      
      // Materiales
      if (producto.nombreMaterial) {
        materialesSet.add(producto.nombreMaterial);
      }
      
      // Públicos
      if (producto.nombrePublico) {
        publicosSet.add(producto.nombrePublico);
      }
    }
    
    setMarcasUnicas([...marcasSet].sort());
    setMaterialesUnicos([...materialesSet].sort());
    setPublicosUnicos([...publicosSet].sort());
    setCargandoFiltros(false);
    
    console.log("Marcas únicas:", [...marcasSet].sort());
  }, [stock]);

  // Detectar tipo de producto según el filtro principal
  useEffect(() => {
    if (filtro === 'calzado' || filtro === 'bolsos') {
      setTipoProductoActual(filtro);
    } else if (filtro === 'todos') {
      setTipoProductoActual('todos');
    }
  }, [filtro]);

  // Cargar imágenes
  useEffect(() => {
    const cargarImagenes = async () => {
      if (stock && stock.length > 0) {
        const todasImagenes = {};
        
        const productosParaCargar = productosFiltrados.length > 0 
          ? productosFiltrados 
          : stock;
        
        for (const producto of productosParaCargar) {
          if (producto.idProducto && !todasImagenes[producto.idProducto]) {
            try {
              const response = await getImagenById(producto.idProducto);
              if (response.data && response.data.length > 0) {
                todasImagenes[producto.idProducto] = `http://35.171.131.177:8080${response.data[0].urlImagen}`;
              } else {
                todasImagenes[producto.idProducto] = producto.imagen || "/imagenes_prueba/default.jpg";
              }
            } catch (error) {
              console.error(`Error al cargar imagen para producto ${producto.idProducto}:`, error);
              todasImagenes[producto.idProducto] = producto.imagen || "/imagenes_prueba/default.jpg";
            }
          }
        }
        
        setImagenesProductos(todasImagenes);
      }
    };
    
    cargarImagenes();
  }, [stock, productosFiltrados]);

  // FUNCIÓN DE FILTRADO PRINCIPAL (basada en tu Catalogo.js)
  useEffect(() => {
    if (!stock || stock.length === 0) {
      setProductosFiltrados([]);
      return;
    }

    let filtrados = [...stock];

    // PRIMERO: Aplicar filtro principal (categoría general) - IGUAL QUE EN CATALOGO.JS
    if (filtro !== 'todos') {
      filtrados = filtrados.filter(producto => {
        const publicoLower = producto.nombrePublico?.toLowerCase() || '';
        const tipoLower = producto.nombreTipoProducto?.toLowerCase() || '';
        const nombreLower = producto.nombreProducto?.toLowerCase() || '';
        const categoriaLower = producto.nombreCategoria?.toLowerCase() || '';
        
        const esNumero = !isNaN(filtro) && filtro !== '';
        
        if (esNumero) {
          return producto.idCategoria == filtro;
        } else {
          switch(filtro.toLowerCase()) {
            case 'mujer':
              return publicoLower.includes('mujer') || nombreLower.includes('mujer');
            case 'hombre':
              return publicoLower.includes('hombre') || nombreLower.includes('hombre');
            case 'nino':
            case 'niño':
              return publicoLower.includes('niño') || publicoLower.includes('nino') || nombreLower.includes('niño');
            case 'calzado':
              return tipoLower.includes('zapato') || tipoLower.includes('calzado') || nombreLower.includes('zapato');
            case 'bolsos':
              return tipoLower.includes('bolso') || nombreLower.includes('bolso');
            default:
              return categoriaLower.includes(filtro.toLowerCase());
          }
        }
      });
    }

    // SEGUNDO: Aplicar filtros avanzados
    // FILTRO DE MARCA
    if (filtrosAvanzados.marca) {
      filtrados = filtrados.filter(producto => {
        const marca = extraerMarca(producto);
        return marca?.toLowerCase() === filtrosAvanzados.marca.toLowerCase();
      });
    }

    // FILTRO DE MATERIAL
    if (filtrosAvanzados.material) {
      filtrados = filtrados.filter(producto => 
        producto.nombreMaterial?.toLowerCase() === filtrosAvanzados.material.toLowerCase()
      );
    }

    // FILTRO DE PÚBLICO
    if (filtrosAvanzados.publico) {
      filtrados = filtrados.filter(producto => 
        producto.nombrePublico?.toLowerCase() === filtrosAvanzados.publico.toLowerCase()
      );
    }

    // FILTRO DE PRECIO
    if (filtrosAvanzados.precioMin) {
      filtrados = filtrados.filter(producto => 
        producto.precio >= parseFloat(filtrosAvanzados.precioMin)
      );
    }

    if (filtrosAvanzados.precioMax) {
      filtrados = filtrados.filter(producto => 
        producto.precio <= parseFloat(filtrosAvanzados.precioMax)
      );
    }

    // FILTRO ESPECÍFICO PARA BOLSOS (IGUAL QUE EN TU CATALOGO.JS)
    if (tipoProductoActual === 'bolsos' && filtrosAvanzados.tipoBolso) {
      filtrados = filtrados.filter(producto => {
        const nombreLower = producto.nombreProducto?.toLowerCase() || '';
        const tipoLower = producto.nombreTipoProducto?.toLowerCase() || '';
        const termino = filtrosAvanzados.tipoBolso.toLowerCase();
        
        return nombreLower.includes(termino) || tipoLower.includes(termino);
      });
    }

    setProductosFiltrados(filtrados);
  }, [stock, filtro, filtrosAvanzados, tipoProductoActual]);

  // Función para manejar cambios en filtros avanzados
  const manejarCambioFiltro = (nombre, valor) => {
    setFiltrosAvanzados(prev => ({
      ...prev,
      [nombre]: valor
    }));
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltrosAvanzados({
      precioMin: "",
      precioMax: "",
      marca: "",
      material: "",
      publico: "",
      tipoBolso: ""
    });
  };

  // Función para cambiar el tipo de producto (Zapatos/Bolsos)
  const cambiarTipoProducto = (tipo) => {
    setFiltro(tipo);
    setMostrarFiltros(false);
  };

  // Función para seleccionar/deseleccionar marca
  const toggleMarca = (marca) => {
    if (filtrosAvanzados.marca === marca) {
      manejarCambioFiltro('marca', '');
    } else {
      manejarCambioFiltro('marca', marca);
    }
  };

  // Función para obtener la imagen
  const obtenerImagenProducto = (producto) => {
    if (producto.idProducto && imagenesProductos[producto.idProducto]) {
      return imagenesProductos[producto.idProducto];
    }
    return producto.imagen || "/imagenes_prueba/default.jpg";
  };

  // Obtener nombre de la categoría para mostrar
  const obtenerNombreCategoria = () => {
    if (filtro === 'todos') return 'Todos los productos';
    if (filtro === 'mujer') return 'Calzado para Mujer';
    if (filtro === 'hombre') return 'Calzado para Hombre';
    if (filtro === 'nino' || filtro === 'niño') return 'Calzado para Niño';
    if (filtro === 'calzado') return 'Todo el Calzado';
    if (filtro === 'bolsos') return 'Bolsos';
    
    if (productosFiltrados.length > 0) {
      const primerProducto = productosFiltrados[0];
      return primerProducto.nombreCategoria || `Categoría ${filtro}`;
    }
    
    return `Categoría ${filtro}`;
  };

  return (
    <div className="catalogo-mobile-container" id="catalogo-mobile-container">
      <MenuHome />
      <div className="catalogo-mobile-background" id="catalogo-mobile-background">
        <div className="catalogo-mobile-wrapper" id="catalogo-mobile-wrapper">
          
          {/* BOTONES DE TIPO DE PRODUCTO (ZAPATOS / BOLSOS) */}
          <div className="tipo-producto-buttons">
            <button
              className={`tipo-btn ${filtro === 'calzado' ? 'active' : ''}`}
              onClick={() => cambiarTipoProducto('calzado')}
            >
              <i className="bi bi-grid-3x3-gap-fill"></i>
              <span>Zapatos</span>
            </button>
            <button
              className={`tipo-btn ${filtro === 'bolsos' ? 'active' : ''}`}
              onClick={() => cambiarTipoProducto('bolsos')}
            >
              <i className="bi bi-bag-fill"></i>
              <span>Bolsos</span>
            </button>
          </div>

          {/* HEADER SIMPLIFICADO - SIN BÚSQUEDA */}
          <div className="catalogo-mobile-header" id="catalogo-mobile-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="categoria-titulo" id="categoria-titulo-mobile">
                  {obtenerNombreCategoria()}
                </h2>
                <p className="contador-productos" id="contador-productos-mobile">
                  {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Botón para mostrar/ocultar filtros */}
              <button 
                className="btn btn-outline-primary filtros-mobile-btn"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <i className={`bi bi-${mostrarFiltros ? 'chevron-up' : 'funnel'}`}></i>
                {mostrarFiltros ? ' Ocultar' : ' Filtros'}
              </button>
            </div>
          </div>

          {/* FILTROS AVANZADOS - CON FILTRO DE MARCAS */}
          {mostrarFiltros && (
            <FiltrosAvanzadosMobile
              tipoProducto={tipoProductoActual}
              filtros={filtrosAvanzados}
              onCambioFiltro={manejarCambioFiltro}
              onLimpiarFiltros={limpiarFiltros}
              onToggleMarca={toggleMarca}
              marcasDisponibles={marcasUnicas}
              materialesDisponibles={materialesUnicos}
              publicosDisponibles={publicosUnicos}
              cargando={cargandoFiltros}
            />
          )}

          {/* GRILLA DE PRODUCTOS */}
          <div className="products-grid-mobile" id="products-grid-mobile">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto, index) => {
                const imagenProducto = obtenerImagenProducto(producto);
                const marca = extraerMarca(producto);
                
                return (
                  <div key={producto.codigoReferencia || index} className="product-card-wrapper-mobile">
                    <Link to={`/home/${producto.codigoReferencia}`} className="product-card-mobile">
                      <div className="product-image-container-mobile">
                        <img
                          src={imagenProducto}
                          className="product-image-mobile"
                          alt={producto.nombreProducto || 'Producto'}
                          onError={(e) => {
                            e.target.src = "/imagenes_prueba/default.jpg";
                          }}
                        />
                        {marca && (
                          <div className="product-marca-badge">
                            {marca}
                          </div>
                        )}
                      </div>
                      <div className="product-info-mobile">
                        <h3 className="product-name-mobile">
                          {producto.nombreProducto || 'Producto'}
                        </h3>
                        <p className="product-price-mobile">
                          ${producto.precio?.toLocaleString() || '0'}
                        </p>
                        <div className="product-details-mobile">
                          {producto.nombreColor && (
                            <span className="product-color-mobile">
                              <i className="bi bi-palette"></i> {producto.nombreColor}
                            </span>
                          )}
                          {producto.nombreMaterial && (
                            <span className="product-material-mobile">
                              <i className="bi bi-grid"></i> {producto.nombreMaterial}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="no-productos-mobile">
                <i className="bi bi-emoji-frown no-productos-icono"></i>
                <p>No se encontraron productos</p>
                <button 
                  onClick={limpiarFiltros}
                  className="btn btn-primary"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// Componente de filtros específico para móvil
const FiltrosAvanzadosMobile = ({ 
    tipoProducto, 
    filtros, 
    onCambioFiltro, 
    onLimpiarFiltros,
    onToggleMarca,
    marcasDisponibles,
    materialesDisponibles,
    publicosDisponibles,
    cargando = false
}) => {
    
    const esBolso = tipoProducto === 'bolsos';

    return (
        <div className="filtros-mobile-panel">
            <div className="filtros-mobile-header">
                <h4>Filtrar productos</h4>
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onLimpiarFiltros}
                >
                    <i className="bi bi-eraser"></i> Limpiar
                </button>
            </div>

            <div className="filtros-mobile-grid">
                {/* FILTRO DE PRECIO */}
                <div className="filtro-mobile-grupo">
                    <label className="filtro-mobile-label">Precio</label>
                    <div className="precio-mobile-inputs">
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Mín"
                            value={filtros.precioMin}
                            onChange={(e) => onCambioFiltro('precioMin', e.target.value)}
                            min="0"
                        />
                        <span className="precio-separador">-</span>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Máx"
                            value={filtros.precioMax}
                            onChange={(e) => onCambioFiltro('precioMax', e.target.value)}
                            min="0"
                        />
                    </div>
                </div>

                {/* FILTRO DE MARCAS */}
                {marcasDisponibles.length > 0 && (
                    <div className="filtro-mobile-grupo">
                        <label className="filtro-mobile-label">Marcas</label>
                        {cargando ? (
                            <div className="text-muted small">Cargando marcas...</div>
                        ) : (
                            <div className="marcas-grid">
                                {marcasDisponibles.map((marca, index) => (
                                    <button
                                        key={index}
                                        className={`marca-btn ${filtros.marca === marca ? 'active' : ''}`}
                                        onClick={() => onToggleMarca(marca)}
                                    >
                                        {marca}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* FILTRO DE MATERIAL */}
                {materialesDisponibles.length > 0 && (
                    <div className="filtro-mobile-grupo">
                        <label className="filtro-mobile-label">Material</label>
                        <select
                            className="form-select form-select-sm"
                            value={filtros.material}
                            onChange={(e) => onCambioFiltro('material', e.target.value)}
                        >
                            <option value="">Todos los materiales</option>
                            {materialesDisponibles.map((material, index) => (
                                <option key={index} value={material}>
                                    {material}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* FILTRO DE PÚBLICO */}
                {publicosDisponibles.length > 0 && (
                    <div className="filtro-mobile-grupo">
                        <label className="filtro-mobile-label">Género</label>
                        <select
                            className="form-select form-select-sm"
                            value={filtros.publico}
                            onChange={(e) => onCambioFiltro('publico', e.target.value)}
                        >
                            <option value="">Todos</option>
                            {publicosDisponibles.map((publico, index) => (
                                <option key={index} value={publico}>
                                    {publico}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* FILTRO ESPECÍFICO PARA BOLSOS */}
                {esBolso && (
                    <div className="filtro-mobile-grupo">
                        <label className="filtro-mobile-label">Tipo de bolso</label>
                        <select
                            className="form-select form-select-sm"
                            value={filtros.tipoBolso || ''}
                            onChange={(e) => onCambioFiltro('tipoBolso', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="bandolera">Bandolera</option>
                            <option value="mochila">Mochila</option>
                            <option value="cartera">Cartera</option>
                            <option value="tote">Tote</option>
                            <option value="bolso">Bolso</option>
                        </select>
                    </div>
                )}
            </div>

            {/* FILTROS ACTIVOS */}
            {(filtros.precioMin || filtros.precioMax || filtros.marca || 
              filtros.material || filtros.publico || filtros.tipoBolso) && (
                <div className="filtros-activos-mobile mt-3">
                    <small className="text-muted">Filtros activos:</small>
                    <div className="filtros-activos-lista-mobile">
                        {filtros.precioMin && (
                            <span className="filtro-activo-badge">
                                Desde ${filtros.precioMin}
                                <button onClick={() => onCambioFiltro('precioMin', '')}>×</button>
                            </span>
                        )}
                        {filtros.precioMax && (
                            <span className="filtro-activo-badge">
                                Hasta ${filtros.precioMax}
                                <button onClick={() => onCambioFiltro('precioMax', '')}>×</button>
                            </span>
                        )}
                        {filtros.marca && (
                            <span className="filtro-activo-badge">
                                Marca: {filtros.marca}
                                <button onClick={() => onCambioFiltro('marca', '')}>×</button>
                            </span>
                        )}
                        {filtros.material && (
                            <span className="filtro-activo-badge">
                                Material: {filtros.material}
                                <button onClick={() => onCambioFiltro('material', '')}>×</button>
                            </span>
                        )}
                        {filtros.publico && (
                            <span className="filtro-activo-badge">
                                {filtros.publico}
                                <button onClick={() => onCambioFiltro('publico', '')}>×</button>
                            </span>
                        )}
                        {filtros.tipoBolso && esBolso && (
                            <span className="filtro-activo-badge">
                                Tipo: {filtros.tipoBolso}
                                <button onClick={() => onCambioFiltro('tipoBolso', '')}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogoMobile;