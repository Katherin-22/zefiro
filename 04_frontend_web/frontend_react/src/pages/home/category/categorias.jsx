import React, { useState, useEffect, useMemo , useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFiltro } from "../../../utils/FiltroContextx";
import MenuHome from "../../../layouts/home/menuHome";
import api_url from "../../../services/administrador/api"; // Tu instancia de axios
import "../../../styles/home/categoria.css";

const CategoriasMobilePage = () => {
  const navigate = useNavigate();
  const { setFiltro } = useFiltro();

  // Estados para las categorías del backend
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icons para diferentes tipos de categorías
  const iconosPorTipo = useMemo(() => ({
    'mujer': '👩',
    'hombre': '👨',
    'nino': '👶',
    'niño': '👶',
    'calzado': '👟',
    'zapato': '👠',
    'tenis': '👟',
    'running': '🏃',
    'casual': '👞',
    'formal': '👔',
    'deportivo': '⚽',
    'bolso': '👜',
    'cartera': '👛',
    'mochila': '🎒',
    'bandolera': '👜',
    'tote': '🛍️',
    'default': '📦'
  }), []);

  // Colores para categorías
  const coloresCategoria = useMemo(() => [
    "#E0B253", // primary-color de tu tema
    "#FF6B9D", // rosa
    "#4A90E2", // azul
    "#7ED321", // verde
    "#8B572A", // marrón
    "#9013FE", // púrpura
    "#F5A623", // naranja
    "#50E3C2", // turquesa
    "#BD10E0", // magenta
    "#417505"  // verde oscuro
  ], []);

  // Función para obtener icono basado en nombre de categoría
  const obtenerIconoCategoria = useCallback((nombre) => {
    if (!nombre) return iconosPorTipo.default;

    const nombreLower = nombre.toLowerCase();

    for (const [key, icono] of Object.entries(iconosPorTipo)) {
      if (nombreLower.includes(key)) {
        return icono;
      }
    }

    return iconosPorTipo.default;
  }, [iconosPorTipo]);

  // Función para mapear categorías a valores que entiende el catálogo
  const mapearValorFiltro = (categoria) => {
    const nombre = categoria.nombreCategoria || categoria.nombre || '';
    const nombreLower = nombre.toLowerCase();
    
    // Mapeo de categorías especiales
    if (nombreLower.includes('mujer')) return 'mujer';
    if (nombreLower.includes('hombre')) return 'hombre';
    if (nombreLower.includes('niño') || nombreLower.includes('nino')) return 'nino';
    
    // Para calzado, mapeamos a 'calzado'
    if (nombreLower.includes('calzado') || 
        nombreLower.includes('zapato') || 
        nombreLower.includes('tenis') || 
        nombreLower.includes('running') || 
        nombreLower.includes('casual') || 
        nombreLower.includes('deportivo')) {
      return 'calzado';
    }
    
    // Para bolsos, mapeamos a 'bolsos'
    if (nombreLower.includes('bolso') || 
        nombreLower.includes('cartera') || 
        nombreLower.includes('mochila') || 
        nombreLower.includes('bandolera') || 
        nombreLower.includes('tote')) {
      return 'bolsos';
    }
    
    // Si tiene ID numérico, usarlo
    if (categoria.idCategoria && !isNaN(categoria.idCategoria)) {
      return categoria.idCategoria;
    }
    
    // Por defecto, usar el nombre completo (puede no funcionar)
    return nombreLower;
  };

  // Obtener categorías del backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const response = await api_url.get('/publico/categorias');

        const categoriasMapeadas = response.data.map((cat, index) => ({
          id: cat.idCategoria || cat.id || index,
          nombre: cat.nombreCategoria || cat.nombre || `Categoría ${index + 1}`,
          descripcion: cat.descripcion || `Productos de ${cat.nombreCategoria || 'esta categoría'}`,
          tipoProducto: cat.nombreTipoProducto || cat.tipo || '',
          icono: obtenerIconoCategoria(cat.nombreCategoria || cat.nombre),
          color: coloresCategoria[index % coloresCategoria.length],
          // Valor para el filtro (mapeado)
          filtroValue: mapearValorFiltro(cat)
        }));

        setCategorias(categoriasMapeadas);
        setError(null);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setError("No se pudieron cargar las categorías");
        setCategorias(getCategoriasRespaldo());
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [coloresCategoria, obtenerIconoCategoria]);

  // Categorías de respaldo si falla el backend
  const getCategoriasRespaldo = () => {
    return [
      { 
        id: "todos", 
        nombre: "Todos", 
        descripcion: "Ver todos los productos", 
        icono: "📦", 
        color: "#E0B253",
        filtroValue: "todos"
      },
      { 
        id: "mujer", 
        nombre: "Mujer", 
        descripcion: "Productos para mujer", 
        icono: "👩", 
        color: "#FF6B9D",
        filtroValue: "mujer"
      },
      { 
        id: "hombre", 
        nombre: "Hombre", 
        descripcion: "Productos para hombre", 
        icono: "👨", 
        color: "#4A90E2",
        filtroValue: "hombre"
      },
      { 
        id: "calzado", 
        nombre: "Calzado", 
        descripcion: "Todo el calzado", 
        icono: "👟", 
        color: "#7ED321",
        filtroValue: "calzado"
      },
      { 
        id: "running", 
        nombre: "Running", 
        descripcion: "Calzado para running", 
        icono: "🏃", 
        color: "#F5A623",
        filtroValue: "calzado" // ¡Importante! Mapeamos running a calzado
      },
      { 
        id: "casual", 
        nombre: "Casual", 
        descripcion: "Calzado casual", 
        icono: "👞", 
        color: "#50E3C2",
        filtroValue: "calzado" // ¡Importante! Mapeamos casual a calzado
      },
      { 
        id: "deportivo", 
        nombre: "Deportivo", 
        descripcion: "Calzado deportivo", 
        icono: "⚽", 
        color: "#BD10E0",
        filtroValue: "calzado" // ¡Importante! Mapeamos deportivo a calzado
      },
      { 
        id: "bolsos", 
        nombre: "Bolsos", 
        descripcion: "Todos los bolsos", 
        icono: "👜", 
        color: "#9013FE",
        filtroValue: "bolsos"
      }
    ];
  };

  const seleccionarCategoria = (categoria) => {
    console.log("Categoría seleccionada:", categoria);
    console.log("Valor para filtro:", categoria.filtroValue);
    
    // Establecer el filtro con el valor mapeado
    setFiltro(categoria.filtroValue);
    
    // Navegar al catálogo móvil
    navigate("/home/catalogo");
  };

  if (loading) {
    return (
      <div className="categorias-page-container">
        <MenuHome />
        <div className="categorias-loading">
          <div className="loading-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categorias-page-container">
        <MenuHome />
        <div className="categorias-error">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="categorias-page-container">
      <MenuHome />

      <div className="categorias-page-content">
        {/* HEADER */}
        <header className="categorias-page-header">
          <div className="categorias-header-content">
            <button
              className="categorias-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Volver"
            >
              ←
            </button>
            <h1 className="categorias-page-title">Categorías</h1>
            <div className="categorias-header-spacer"></div>
          </div>
          <p className="categorias-page-subtitle">
            {categorias.length} categoría{categorias.length !== 1 ? 's' : ''} disponible{categorias.length !== 1 ? 's' : ''}
          </p>
        </header>

        {/* LISTA DE CATEGORÍAS */}
        <main className="categorias-grid-container">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="categoria-card-mobile"
              onClick={() => seleccionarCategoria(cat)}
              style={{ '--categoria-color': cat.color }}
            >
              <div className="categoria-card-content">
                <div className="categoria-icon-container">
                  <span className="categoria-icon-large">{cat.icono}</span>
                </div>
                <div className="categoria-text-container">
                  <h3 className="categoria-card-title">{cat.nombre}</h3>
                  {cat.tipoProducto && (
                    <span className="categoria-tipo-badge">{cat.tipoProducto}</span>
                  )}
                  <p className="categoria-card-desc">{cat.descripcion}</p>
                </div>
                <div className="categoria-arrow">
                  <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* FOOTER */}
        <footer className="categorias-page-footer">
          <p className="categorias-footer-text">
            <span className="categorias-footer-icon">ℹ️</span>
            Selecciona una categoría para ver los productos
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CategoriasMobilePage;