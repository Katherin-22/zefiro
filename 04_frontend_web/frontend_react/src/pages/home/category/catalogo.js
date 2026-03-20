import React, { useState, useEffect } from "react";
import { useGetStock } from "../../../hooks/stock/useGetStock";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuHome from "../../../layouts/home/menuHome";
import { useFiltro } from "../../../utils/FiltroContextx";
import { getImagenById } from "../../../services/administrador/ImagenService.js";
import { useResponsive } from "../../../hooks/responsive/responsive";
import FiltrosAvanzados from "./filtrosAvanzados.js";
import "../../../styles/home/canalogoHome.css";
import api_url from "../../../services/administrador/api.js";

const Catalogo = () => {
  const { stock } = useGetStock();
  const { filtro, setFiltro } = useFiltro();
  const { isMobile } = useResponsive();
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para filtros avanzados
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    precioMin: "",
    precioMax: "",
    color: "",
    material: "",
    publico: "",
    tipoBolso: ""
  });
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoProductoActual, setTipoProductoActual] = useState('');

  // Estado para colores únicos (obtenidos de la API como en ProductoGen)
  const [coloresUnicos, setColoresUnicos] = useState([]);
  const [materialesUnicos, setMaterialesUnicos] = useState([]);
  const [publicosUnicos, setPublicosUnicos] = useState([]);
  const [cargandoColores, setCargandoColores] = useState(false);

  // Función para obtener colores de un producto específico (como en ProductoGen)
  const obtenerColoresPorProducto = async (idProducto) => {
    try {
      const response = await api_url.get(`/publico/stock/producto/${idProducto}/color`);
      return response.data || [];
    } catch (error) {
      console.error(`Error al cargar colores para producto ${idProducto}:`, error);
      return [];
    }
  };

  // Obtener TODOS los colores únicos de TODOS los productos
  useEffect(() => {
    const cargarTodosLosColores = async () => {
      if (!stock || stock.length === 0) return;
      
      setCargandoColores(true);
      const coloresSet = new Set();
      const materialesSet = new Set();
      const publicosSet = new Set();
      
      // Por cada producto, obtenemos sus colores de la API
      for (const producto of stock) {
        if (producto.idProducto) {
          // Colores del producto (como en ProductoGen)
          const coloresProducto = await obtenerColoresPorProducto(producto.idProducto);
          coloresProducto.forEach(color => {
            if (color.nombreColor) {
              coloresSet.add(color.nombreColor);
            }
          });
          
          // Materiales (del stock por ahora)
          if (producto.nombreMaterial) {
            materialesSet.add(producto.nombreMaterial);
          }
          
          // Públicos
          if (producto.nombrePublico) {
            publicosSet.add(producto.nombrePublico);
          }
        }
      }
      
      setColoresUnicos([...coloresSet].sort());
      setMaterialesUnicos([...materialesSet].sort());
      setPublicosUnicos([...publicosSet].sort());
      setCargandoColores(false);
      
      console.log("Colores únicos de la API:", [...coloresSet].sort());
    };
    
    cargarTodosLosColores();
  }, [stock]);

  // Obtener parámetro de búsqueda de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    const tipo = searchParams.get('tipo');
    
    if (search) {
      setSearchTerm(search);
    } else {
      setSearchTerm("");
    }
    
    if (tipo) {
      setTipoProductoActual(tipo);
    }
  }, [location.search]);

  // Detectar tipo de producto según el filtro principal
  useEffect(() => {
    if (filtro === 'calzado' || filtro === 'bolsos') {
      setTipoProductoActual(filtro);
    } else if (filtro === 'todos') {
      setTipoProductoActual('');
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

  // FUNCIÓN DE FILTRADO PRINCIPAL
  useEffect(() => {
    if (!stock || stock.length === 0) {
      setProductosFiltrados([]);
      return;
    }

    let filtrados = [...stock];

    // PRIMERO: Aplicar filtro principal (categoría general)
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

    // SEGUNDO: Aplicar filtros avanzados SIEMPRE (sin importar el tipo de producto)
    // FILTRO DE COLOR - Usando el nombreColor que ya está en cada producto
    if (filtrosAvanzados.color) {
      filtrados = filtrados.filter(producto => {
        return producto.nombreColor?.toLowerCase() === filtrosAvanzados.color.toLowerCase();
      });
    }

    // FILTRO DE MATERIAL
    if (filtrosAvanzados.material) {
      filtrados = filtrados.filter(producto => {
        return producto.nombreMaterial?.toLowerCase() === filtrosAvanzados.material.toLowerCase();
      });
    }

    // FILTRO DE PÚBLICO
    if (filtrosAvanzados.publico) {
      filtrados = filtrados.filter(producto => {
        return producto.nombrePublico?.toLowerCase() === filtrosAvanzados.publico.toLowerCase();
      });
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

    // FILTRO ESPECÍFICO PARA BOLSOS (solo aplica si es necesario)
    if (tipoProductoActual === 'bolsos' && filtrosAvanzados.tipoBolso) {
      filtrados = filtrados.filter(producto => {
        const nombreLower = producto.nombreProducto?.toLowerCase() || '';
        const tipoLower = producto.nombreTipoProducto?.toLowerCase() || '';
        const termino = filtrosAvanzados.tipoBolso.toLowerCase();
        
        return nombreLower.includes(termino) || tipoLower.includes(termino);
      });
    }

    // TERCERO: Aplicar búsqueda por texto
    if (searchTerm.trim() !== "") {
      const terminoBusqueda = searchTerm.toLowerCase();
      filtrados = filtrados.filter(producto => {
        return (
          producto.nombreProducto?.toLowerCase().includes(terminoBusqueda) ||
          producto.descripcion?.toLowerCase().includes(terminoBusqueda) ||
          producto.codigoReferencia?.toLowerCase().includes(terminoBusqueda) ||
          producto.nombreCategoria?.toLowerCase().includes(terminoBusqueda) ||
          producto.nombreTipoProducto?.toLowerCase().includes(terminoBusqueda) ||
          producto.nombreMaterial?.toLowerCase().includes(terminoBusqueda) ||
          producto.nombrePublico?.toLowerCase().includes(terminoBusqueda)
        );
      });
    }

    setProductosFiltrados(filtrados);
  }, [stock, filtro, filtrosAvanzados, searchTerm, tipoProductoActual]);

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
      color: "",
      material: "",
      publico: "",
      tipoBolso: ""
    });
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
    if (searchTerm) {
      return `Resultados para: "${searchTerm}"`;
    }
    
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

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setSearchTerm("");
    navigate('/Catalogo');
  };

  // Buscar de nuevo desde aquí
  const buscarNuevo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevaBusqueda = formData.get('nuevaBusqueda');
    
    if (nuevaBusqueda.trim()) {
      navigate(`/Catalogo?search=${encodeURIComponent(nuevaBusqueda)}`);
    }
  };

  return (
    <div className="catalogo-container" id="catalogo-container">
      <MenuHome />
      <div className="catalogo-background" id="catalogo-background">
        <div className="catalogo-wrapper" id="catalogo-wrapper">
          
          {/* HEADER CON FILTROS */}
          <div className="catalogo-header" id="catalogo-header">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h2 className="categoria-titulo" id="categoria-titulo">
                  {obtenerNombreCategoria()}
                </h2>
                <p className="contador-productos" id="contador-productos">
                  {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Botón para mostrar/ocultar filtros en móvil */}
              {isMobile && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                >
                  <i className={`bi bi-${mostrarFiltros ? 'chevron-up' : 'funnel'}`}></i>
                  {mostrarFiltros ? ' Ocultar filtros' : ' Mostrar filtros'}
                </button>
              )}
            </div>

            {/* Buscador */}
            <form onSubmit={buscarNuevo} className="buscador-catalogo mt-3" id="buscador-catalogo">
              <div className="input-group" id="buscador-catalogo-input-group">
                <input
                  type="text"
                  name="nuevaBusqueda"
                  className="form-control"
                  id="buscador-catalogo-input"
                  placeholder="Buscar en el catálogo..."
                  defaultValue={searchTerm}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  id="buscador-catalogo-btn"
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>

          {/* FILTROS AVANZADOS - AHORA SIEMPRE SE MUESTRAN */}
          <FiltrosAvanzados
            tipoProducto={tipoProductoActual}
            filtros={filtrosAvanzados}
            onCambioFiltro={manejarCambioFiltro}
            onLimpiarFiltros={limpiarFiltros}
            coloresDisponibles={coloresUnicos}
            materialesDisponibles={materialesUnicos}
            publicosDisponibles={publicosUnicos}
            mostrar={!isMobile || mostrarFiltros}
            isMobile={isMobile}
            cargando={cargandoColores}
          />

          {/* GRILLA DE PRODUCTOS - EXACTAMENTE IGUAL A TU ORIGINAL */}
          <div className="products-grid" id="products-grid">
            {productosFiltrados.map((producto, index) => {
              const imagenProducto = obtenerImagenProducto(producto);
              
              // Resaltar término de búsqueda en el nombre
              const nombreProducto = searchTerm ? (
                <span dangerouslySetInnerHTML={{
                  __html: producto.nombreProducto.replace(
                    new RegExp(searchTerm, 'gi'),
                    match => `<mark class="highlight">${match}</mark>`
                  )
                }} />
              ) : producto.nombreProducto;
              
              return (
                <div key={producto.codigoReferencia} className="product-card-wrapper" id={`product-card-wrapper-${index}`}>
                  <div className="product-card" id={`product-card-${index}`}>
                    <div className="product-image-container" id={`product-image-container-${index}`}>
                      <img
                        src={imagenProducto}
                        className="product-image"
                        alt={producto.nombreProducto}
                        id={`product-image-${index}`}
                        onError={(e) => {
                          e.target.src = "/imagenes_prueba/default.jpg";
                        }}
                      />
                      {searchTerm && (
                        <div className="product-badge-busqueda" id={`product-badge-busqueda-${index}`}>
                          <i className="bi bi-search"></i>
                          Coincidencia
                        </div>
                      )}
                    </div>
                    <div className="product-info" id={`product-info-${index}`}>
                      <h3 className="product-name" id={`product-name-${index}`}>
                        {nombreProducto}
                      </h3>
                      {producto.nombreCategoria && (
                        <p className="product-category" id={`product-category-${index}`}>
                          {producto.nombreCategoria}
                        </p>
                      )}
                      <p className="product-type" id={`product-type-${index}`}>
                        {producto.nombreTipoProducto}
                      </p>
                      <p className="product-gender" id={`product-gender-${index}`}>
                        {producto.nombrePublico}
                      </p>
                      <p className="product-price" id={`product-price-${index}`}>
                        Precio: <span className="price-value" id={`price-value-${index}`}>
                          ${producto.precio?.toLocaleString()}
                        </span>
                      </p>
                      {/* AQUÍ ESTÁ EL CAMPO nombreColor QUE YA TIENES */}
                      {producto.nombreColor && (
                        <p className="product-color" id={`product-color-${index}`}>
                          Color: {producto.nombreColor}
                        </p>
                      )}
                      <p className="product-code" id={`product-code-${index}`}>
                        Código: {producto.codigoReferencia}
                      </p>
                      <Link to={`/home/${producto.codigoReferencia}`} className="product-link" id={`product-link-${index}`}>
                        Ver producto
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MENSAJE SI NO HAY PRODUCTOS */}
          {productosFiltrados.length === 0 && (
            <div className="no-productos" id="no-productos">
              {searchTerm ? (
                <>
                  <i className="bi bi-search no-productos-icono" id="no-productos-icono-busqueda"></i>
                  <p id="no-productos-message">
                    No se encontraron productos para <strong>"{searchTerm}"</strong>
                  </p>
                  <div className="sugerencias-busqueda" id="sugerencias-busqueda">
                    <p>Sugerencias:</p>
                    <ul>
                      <li>Verifica la ortografía</li>
                      <li>Usa términos más generales</li>
                      <li>Prueba con otras palabras clave</li>
                      <li>Explora las categorías principales</li>
                    </ul>
                  </div>
                  <div className="botones-busqueda" id="botones-busqueda">
                    <button 
                      onClick={limpiarBusqueda}
                      className="volver-categorias-btn"
                      id="volver-categorias-btn"
                    >
                      ← Ver todos los productos
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p id="no-productos-message">
                    No se encontraron productos para "{obtenerNombreCategoria()}"
                  </p>
                  <button 
                    onClick={limpiarFiltros}
                    className="volver-categorias-btn"
                    id="volver-categorias-btn"
                  >
                    ← Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Catalogo;