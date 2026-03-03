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
    'bolso': '👜',
    'cartera': '👛',
    'ropa': '👕',
    'accesorio': '🧣',
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

  // Obtener categorías del backend
  useEffect(() => {
    const fetchCategorias = async () => {
      // [Contenido de la función fetchCategorias sin cambios]
      try {
        setLoading(true);
        const response = await api_url.get('/publico/categorias');

        const categoriasMapeadas = response.data.map((cat, index) => ({
          id: cat.idCategoria || cat.id || index,
          nombre: cat.nombreCategoria || cat.nombre || `Categoría ${index + 1}`,
          descripcion: cat.descripcion || `Productos de ${cat.nombreCategoria || 'esta categoría'}`,
          tipoProducto: cat.nombreTipoProducto || cat.tipo || '',
          icono: obtenerIconoCategoria(cat.nombreCategoria || cat.nombre),
          color: coloresCategoria[index % coloresCategoria.length]
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
  }, [coloresCategoria, obtenerIconoCategoria]); // Dependencias estables, sin warning



  // Categorías de respaldo si falla el backend
  const getCategoriasRespaldo = () => {
    return [
      { id: "todos", nombre: "Todos", descripcion: "Ver todos los productos", icono: "📦", color: "#E0B253" },
      { id: "mujer", nombre: "Mujer", descripcion: "Productos para mujer", icono: "👩", color: "#FF6B9D" },
      { id: "hombre", nombre: "Hombre", descripcion: "Productos para hombre", icono: "👨", color: "#4A90E2" }
    ];
  };

  const seleccionarCategoria = (categoriaId) => {
    // Encontrar la categoría seleccionada
    const categoriaSeleccionada = categorias.find(cat => cat.id === categoriaId);

    // Guardar en contexto el filtro (puedes usar ID o nombre según tu lógica)
    setFiltro(categoriaSeleccionada?.nombre || categoriaId);

    // Navegar al catálogo
    navigate("/catalogo");
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
              onClick={() => navigate(-1)}// boton y funcionalidad para volver atras
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
              onClick={() => seleccionarCategoria(cat.id)}
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