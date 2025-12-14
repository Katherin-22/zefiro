import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useFiltro } from "../../utils/FiltroContextx";
import { useResponsive } from "../../hooks/responsive/responsive";
import { useGetStock } from "../../hooks/stock/useGetStock";
import "../../styles/home/menuHome.css";
import "../../styles/home/menuMobile.css";

const MenuHome = () => {
  const { setFiltro } = useFiltro();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { stock } = useGetStock();
  
  const [activeMobileNav, setActiveMobileNav] = useState('home');
  const [cartItems] = useState(0);
  const [notification, setNotification] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detectar ruta activa
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveMobileNav('home');
    else if (path === '/catalogo' || path.includes('/catalogo')) setActiveMobileNav('catalog');
    else if (path === '/favoritos') setActiveMobileNav('favorites');
    else if (path === '/carrito') setActiveMobileNav('cart');
    else if (path.includes('/profile') || path === '/loginpage') setActiveMobileNav('profile');
  }, [location]);

  // Filtrar productos en tiempo real cuando cambia searchQuery
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (stock && stock.length > 0) {
      setSearchLoading(true);
      
      // Simular un pequeño delay para mejor UX
      const timer = setTimeout(() => {
        const filtered = stock.filter(item => {
          const searchLower = searchQuery.toLowerCase();
          return (
            item.nombreProducto?.toLowerCase().includes(searchLower) ||
            item.descripcion?.toLowerCase().includes(searchLower) ||
            item.codigoReferencia?.toLowerCase().includes(searchLower) ||
            item.nombreCategoria?.toLowerCase().includes(searchLower) ||
            item.nombreTipoProducto?.toLowerCase().includes(searchLower) ||
            item.nombreMaterial?.toLowerCase().includes(searchLower) ||
            item.nombrePublico?.toLowerCase().includes(searchLower)
          );
        });
        
        setSearchResults(filtered);
        setShowResults(true);
        setSearchLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [searchQuery, stock]);

  const handleFiltro = (nuevoFiltro) => {
    console.log("🔄 Cambiando filtro a:", nuevoFiltro);
    setFiltro(nuevoFiltro);
    navigate('/Catalogo');
    if (isMobile) {
      setActiveMobileNav('catalog');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Función de búsqueda principal
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navegar al catálogo con el término de búsqueda
      navigate(`/Catalogo?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery('');
      if (isMobile) setSearchOpen(false);
    }
  };

  // Buscar en tiempo real
  const handleRealTimeSearch = (query) => {
    setSearchQuery(query);
  };

  // Navegar a un resultado de búsqueda específico
  const navigateToSearchResult = (producto) => {
    navigate(`/home/${producto.codigoReferencia}`);
    setSearchQuery('');
    setShowResults(false);
    if (isMobile) setSearchOpen(false);
    showNotification(`Mostrando: ${producto.nombreProducto}`);
  };

  // Navegar al catálogo con todos los resultados
  const navigateToAllResults = () => {
    if (searchQuery.trim()) {
      navigate(`/Catalogo?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery('');
      if (isMobile) setSearchOpen(false);
      showNotification(`Mostrando todos los resultados para: ${searchQuery}`);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Obtener icono según categoría
  const getProductIcon = (producto) => {
    if (producto.nombreTipoProducto?.toLowerCase().includes('zapat') || 
        producto.nombreTipoProducto?.toLowerCase().includes('calzado')) {
      return 'bi-shoe';
    } else if (producto.nombreTipoProducto?.toLowerCase().includes('bolso')) {
      return 'bi-bag';
    } else if (producto.nombrePublico?.toLowerCase().includes('mujer')) {
      return 'bi-gender-female';
    } else if (producto.nombrePublico?.toLowerCase().includes('hombre')) {
      return 'bi-gender-male';
    }
    return 'bi-box';
  };

  // Desktop Navbar con búsqueda funcional
  const DesktopNavbar = () => (
    <nav className="navbar fixed-top navbar-expand-lg" id="navBarHome" data-bs-theme="dark">
      <div className="container-fluid" id="navBarHome-container">
        
        <Link className="navbar-brand" id="navBarHome-brand" to="/" onClick={() => setFiltro('todos')}>
          Zéfiro
        </Link>

        <button
          className="navbar-toggler"
          id="navBarHome-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navBarHome-content"
          aria-controls="navBarHome-content"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" id="navBarHome-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navBarHome-content">
          
          <ul className="navbar-nav me-auto mb-2 mb-lg-0" id="navBarHome-mainMenu">
            <li className="nav-item dropdown" id="navBarHome-calzado-dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                id="navBarHome-calzado-btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Calzado
              </button>
              <ul className="dropdown-menu" id="navBarHome-calzado-menu">
                <li><button className="dropdown-item" onClick={() => handleFiltro('calzado')}>Todo el Calzado</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={() => handleFiltro('Mujer')}>Para Mujer</button></li>
                <li><button className="dropdown-item" onClick={() => handleFiltro('Hombre')}>Para Hombre</button></li>
                <li><button className="dropdown-item" onClick={() => handleFiltro('nino')}>Para Niño</button></li>
              </ul>
            </li>

            <li className="nav-item" id="navBarHome-bolsos-item">
              <button
                className="nav-link btn btn-link"
                id="navBarHome-bolsos-btn"
                onClick={() => handleFiltro('bolsos')}
              >
                Bolsos
              </button>
            </li>

            <li className="nav-item" id="navBarHome-novedades-item">
              <button
                className="nav-link btn btn-link"
                id="navBarHome-novedades-btn"
                onClick={() => handleFiltro('todos')}
              >
                Novedades
              </button>
            </li>
          </ul>

          {/* BÚSQUEDA DESKTOP MEJORADA */}
          <div className="d-flex me-3 position-relative" id="navBarHome-search" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-100">
              <div className="input-group">
                <input
                  ref={searchInputRef}
                  className="form-control"
                  id="navBarHome-search-input"
                  type="search"
                  placeholder="Buscar productos..."
                  aria-label="Buscar"
                  value={searchQuery}
                  onChange={(e) => handleRealTimeSearch(e.target.value)}
                  onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                />
                <button 
                  className="btn btn-outline-light" 
                  id="navBarHome-search-btn" 
                  type="submit"
                  disabled={searchLoading || !searchQuery.trim()}
                >
                  {searchLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </button>
                {searchQuery && (
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={clearSearch}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </form>

            {/* RESULTADOS DE BÚSQUEDA - MOSTRAR ABAJO */}
            {showResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                <div className="search-results-header">
                  <small className="fw-bold">{searchResults.length} productos encontrados</small>
                  <button 
                    className="btn-close btn-close-sm"
                    onClick={() => setShowResults(false)}
                  ></button>
                </div>
                <div className="search-results-list">
                  {searchResults.slice(0, 5).map(producto => (
                    <button
                      key={producto.idProducto || producto.codigoReferencia}
                      className="search-result-item"
                      onClick={() => navigateToSearchResult(producto)}
                    >
                      <div className="search-result-icon">
                        <i className={`bi ${getProductIcon(producto)}`}></i>
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-title fw-medium">
                          {producto.nombreProducto}
                        </div>
                        <div className="search-result-details">
                          <small className="text-muted">
                            {producto.nombreCategoria} • ${producto.precio?.toLocaleString()}
                          </small>
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-primary"></i>
                    </button>
                  ))}
                </div>
                <div className="search-results-footer p-2 border-top">
                  <button 
                    className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={navigateToAllResults}
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                    Ver todos los resultados ({searchResults.length})
                  </button>
                </div>
              </div>
            )}

            {showResults && searchQuery && searchResults.length === 0 && !searchLoading && (
              <div className="search-results-dropdown">
                <div className="no-results">
                  <i className="bi bi-search text-muted mb-2"></i>
                  <p className="mb-1">No se encontraron productos para "{searchQuery}"</p>
                  <small className="text-muted">Intenta con otras palabras</small>
                </div>
              </div>
            )}
          </div>

          <ul className="navbar-nav" id="navBarHome-userMenu">
            <li className="nav-item dropdown" id="navBarHome-profile-dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                id="navBarHome-profile-btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-fill" id="navBarHome-profile-icon"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" id="navBarHome-profile-menu">
                <li><Link className="dropdown-item" id="navBarHome-login" to="/loginpage">Iniciar sesión</Link></li>
                <li><Link className="dropdown-item" id="navBarHome-profile" to="/profile">Perfil</Link></li>
                <li><Link className="dropdown-item" id="navBarHome-orders" to="/profile">Pedidos</Link></li>
                <li><Link className="dropdown-item" id="navBarHome-orders" to="/Administrador/stock">Dashboard</Link></li>
                <li><hr className="dropdown-divider" id="navBarHome-profile-divider" /></li>
                <li><Link className="dropdown-item" id="navBarHome-logout" onClick={() => {
                  localStorage.clear();
                  window.location.href = '/loginpage';
                }}>Cerrar sesión</Link></li>
              </ul>
            </li>

            <li className="nav-item" id="navBarHome-favorites-item">
              <Link className="nav-link" id="navBarHome-favorites-link" to="/favoritos">
                <i className="bi bi-heart-fill" id="navBarHome-favorites-icon"></i>
              </Link>
            </li>

            <li className="nav-item" id="navBarHome-cart-item">
              <Link className="nav-link" id="navBarHome-cart-link" to="/carrito">
                <i className="bi bi-cart-fill" id="navBarHome-cart-icon"></i>
                {cartItems > 0 && <span className="cart-badge">{cartItems}</span>}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

  // Mobile Navbar con búsqueda funcional
  const MobileNavbar = () => (
    <>
      <nav className="mobile-top-nav" id="mobileTopNav">
        <div className="mobile-top-container">
          <Link className="mobile-brand" to="/" onClick={() => setFiltro('todos')}>
            Zéfiro
          </Link>
          
          <div className="mobile-header-search">
            <button 
              className="mobile-search-btn"
              onClick={() => setSearchOpen(true)}
            >
              <i className="bi bi-search"></i>
            </button>
            
            <Link to="/carrito" className="mobile-cart-btn">
              <i className="bi bi-cart-fill"></i>
              {cartItems > 0 && <span className="cart-badge">{cartItems}</span>}
            </Link>
          </div>
        </div>
      </nav>

      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-container">
          <Link 
            to="/" 
            className={`mobile-nav-item ${activeMobileNav === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveMobileNav('home');
              setFiltro('todos');
            }}
          >
            <i className="bi bi-house"></i>
            <span>Inicio</span>
          </Link>

          <Link 
            to="/categorias-mobile" 
            className={`mobile-nav-item ${activeMobileNav === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('catalog')}
          >
            <i className="bi bi-grid-3x3-gap"></i>
            <span>categorias</span>
          </Link>

          <Link 
            to="/favoritos" 
            className={`mobile-nav-item ${activeMobileNav === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('favorites')}
          >
            <i className="bi bi-heart"></i>
            <span>Favoritos</span>
          </Link>

          <Link 
            to="/profile" 
            className={`mobile-nav-item ${activeMobileNav === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('orders')}
          >
            <i className="bi bi-box-seam"></i>
            <span>Pedidos</span>
          </Link>

          <Link 
            to="/profile" 
            className={`mobile-nav-item ${activeMobileNav === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('profile')}
          >
            <i className="bi bi-person"></i>
            <span>Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Modal de búsqueda móvil */}
      {searchOpen && (
        <div className="mobile-search-modal">
          <div className="mobile-search-header">
            <h5>Buscar productos</h5>
            <button onClick={() => { setSearchOpen(false); clearSearch(); }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="mobile-search-form">
            <div className="mobile-search-input-container">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                value={searchQuery}
                onChange={(e) => handleRealTimeSearch(e.target.value)}
                autoFocus
                className="mobile-search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="mobile-search-clear"
                  onClick={clearSearch}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="mobile-search-submit"
              disabled={searchLoading || !searchQuery.trim()}
            >
              {searchLoading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                'Buscar en catálogo'
              )}
            </button>
          </form>

          {/* Resultados de búsqueda móvil */}
          {searchResults.length > 0 && (
            <div className="mobile-search-results">
              <div className="mobile-results-header">
                <h6>Resultados ({searchResults.length})</h6>
                <small>Selecciona uno o ve todos</small>
              </div>
              <div className="mobile-results-list">
                {searchResults.slice(0, 3).map(producto => (
                  <button
                    key={producto.idProducto || producto.codigoReferencia}
                    className="mobile-result-item"
                    onClick={() => {
                      navigateToSearchResult(producto);
                      setSearchOpen(false);
                    }}
                  >
                    <div className="mobile-result-icon">
                      <i className={`bi ${getProductIcon(producto)}`}></i>
                    </div>
                    <div className="mobile-result-content">
                      <div className="mobile-result-title">{producto.nombreProducto}</div>
                      <div className="mobile-result-details">
                        <small className="text-muted">
                          ${producto.precio?.toLocaleString()}
                        </small>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-primary"></i>
                  </button>
                ))}
              </div>
              <button 
                className="mobile-view-all btn btn-primary mt-3 w-100"
                onClick={navigateToAllResults}
              >
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Ver todos los resultados ({searchResults.length})
              </button>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searchLoading && (
            <div className="mobile-no-results">
              <i className="bi bi-search text-muted"></i>
              <p>No hay resultados para "{searchQuery}"</p>
              <small className="text-muted">Intenta con otros términos</small>
            </div>
          )}

          {/* Sugerencias */}
          <div className="mobile-search-suggestions">
            <h6>Categorías populares</h6>
            <div className="suggestion-buttons">
              <button onClick={() => { handleFiltro('mujer'); setSearchOpen(false); }}>
                <i className="bi bi-gender-female"></i>
                <span>Mujer</span>
              </button>
              <button onClick={() => { handleFiltro('hombre'); setSearchOpen(false); }}>
                <i className="bi bi-gender-male"></i>
                <span>Hombre</span>
              </button>
              <button onClick={() => { handleFiltro('bolsos'); setSearchOpen(false); }}>
                <i className="bi bi-bag"></i>
                <span>Bolsos</span>
              </button>
              <button onClick={() => { handleFiltro('todos'); setSearchOpen(false); }}>
                <i className="bi bi-star"></i>
                <span>Novedades</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="mobile-notification">
          <i className="bi bi-check-circle"></i>
          <span>{notification}</span>
        </div>
      )}
    </>
  );

  return (
    <>
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
      {!isMobile && <Outlet />}
    </>
  );
};

export default MenuHome;