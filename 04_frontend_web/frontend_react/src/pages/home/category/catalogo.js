import React, { useState, useEffect } from "react";
import { useGetStock } from "../../../hooks/stock/useGetStock";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuHome from "../../../layouts/home/menuHome";
import { useFiltro } from "../../../utils/FiltroContextx";
import { getImagenById } from "../../../services/administrador/ImagenService.js";
import "../../../styles/home/canalogoHome.css";

const Catalogo = () => {
  const { stock } = useGetStock();
  const { filtro, setFiltro } = useFiltro(); // Agrega setFiltro
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener parámetro de búsqueda de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    
    if (search) {
      setSearchTerm(search);
      // Limpiar el filtro cuando hay búsqueda
      setFiltro('todos');
    } else {
      setSearchTerm("");
    }
  }, [location.search, setFiltro]);

  // Cargar imágenes
  useEffect(() => {
    const cargarImagenes = async () => {
      if (stock && stock.length > 0) {
        const todasImagenes = {};
        
        // Determinar qué productos necesitan imágenes
        const productosParaCargar = productosFiltrados.length > 0 
          ? productosFiltrados 
          : stock;
        
        for (const producto of productosParaCargar) {
          if (producto.idProducto && !todasImagenes[producto.idProducto]) {
            try {
              const response = await getImagenById(producto.idProducto);
              if (response.data && response.data.length > 0) {
                todasImagenes[producto.idProducto] = `http://localhost:8080${response.data[0].urlImagen}`;
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

  // FUNCIÓN DE FILTRADO ACTUALIZADA CON BÚSQUEDA
  useEffect(() => {
    if (!stock || stock.length === 0) {
      setProductosFiltrados([]);
      return;
    }

    let filtrados = [...stock];

    // PRIMERO: Aplicar filtro normal (categoría)
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

    // SEGUNDO: Aplicar búsqueda por texto
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
  }, [stock, filtro, searchTerm]);

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
    
    // Si es un ID de categoría o nombre personalizado
    if (productosFiltrados.length > 0) {
      const primerProducto = productosFiltrados[0];
      return primerProducto.nombreCategoria || `Categoría ${filtro}`;
    }
    
    return `Categoría ${filtro}`;
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setSearchTerm("");
    navigate('/Catalogo'); // Quitar parámetro de búsqueda de la URL
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
          
          {/* HEADER CON FILTRO/BÚSQUEDA ACTIVA */}
          <div className="filtros-activos" id="filtros-activos">
            <h2 className="categoria-titulo" id="categoria-titulo">
              {obtenerNombreCategoria()}
            </h2>
            
            {/* Mostrar barra de búsqueda activa */}
            {searchTerm && (
              <div className="busqueda-activa" id="busqueda-activa">
                <div className="busqueda-info" id="busqueda-info">
                  <i className="bi bi-search" id="busqueda-icono"></i>
                  <span id="busqueda-termino">{searchTerm}</span>
                  <button 
                    onClick={limpiarBusqueda}
                    className="limpiar-busqueda-btn"
                    id="limpiar-busqueda-btn"
                    title="Limpiar búsqueda"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              </div>
            )}
            
            <p className="contador-productos" id="contador-productos">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            </p>

            {/* Buscador dentro del catálogo */}
            <form onSubmit={buscarNuevo} className="buscador-catalogo" id="buscador-catalogo">
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

          {/* GRILLA DE PRODUCTOS */}
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
                          e.target.src = "/iamgenes_prueba/zapato/im6.jpg";
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
                    <button 
                      onClick={() => navigate('/Catalogo')}
                      className="explorar-catalogo-btn"
                      id="explorar-catalogo-btn"
                    >
                      Explorar catálogo
                    </button>
                  </div>
                </>
              ) : stock.length > 0 ? (
                <>
                  <p id="no-productos-message">
                    No se encontraron productos para "{obtenerNombreCategoria()}"
                  </p>
                  <button 
                    onClick={() => navigate('/Catalogo')}
                    className="volver-categorias-btn"
                    id="volver-categorias-btn"
                  >
                    ← Ver todos los productos
                  </button>
                </>
              ) : (
                <p id="no-productos-message">
                  Cargando productos...
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Catalogo;