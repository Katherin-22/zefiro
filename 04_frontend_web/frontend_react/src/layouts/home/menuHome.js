import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useFiltro } from "../../utils/FiltroContextx";
import { useResponsive } from "../../hooks//responsive/responsive";
import "../../styles/home/menuHome.css";
import "../../styles/home/menuMobile.css";

const MenuHome = () => {
  const { setFiltro } = useFiltro();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  
  const [activeMobileNav, setActiveMobileNav] = useState('home');
  const [cartItems] = useState(0); // agregar  setCartItems
  const [notification, setNotification] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Detectar ruta activa
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveMobileNav('home');
    else if (path === '/catalogo' || path.includes('/catalogo')) setActiveMobileNav('catalog');
    else if (path === '/favoritos') setActiveMobileNav('favorites');
    else if (path === '/carrito') setActiveMobileNav('cart');
    else if (path.includes('/profile') || path === '/loginpage') setActiveMobileNav('profile');
  }, [location]);

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

  // const addToCart = () => {
  //  setCartItems(prev => prev + 1);
  //  showNotification('Producto añadido al carrito!');
  //};

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("🔍 Buscando:", searchQuery);
      setSearchOpen(false);
      showNotification(`Buscando: ${searchQuery}`);
      setSearchQuery('');
    }
  };

  // NAVBAR DESKTOP (solo visible en desktop)
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

          <div className="d-flex me-3" id="navBarHome-search">
            <input
              className="form-control me-2"
              id="navBarHome-search-input"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar"
            />
            <button className="btn btn-outline-light" id="navBarHome-search-btn" type="submit">
              Buscar
            </button>
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
              localStorage.clear()
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
              <Link className="nav-link" id="navBarHome-cart-link" to={`/api/payments/create/{idUsuario}`}>
                <i className="bi bi-cart-fill" id="navBarHome-cart-icon"></i>
                {cartItems > 0 && <span className="cart-badge">{cartItems}</span>}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

  // NAVBAR MÓVIL (solo visible en móvil)
  const MobileNavbar = () => (
    <>
      {/* Header móvil minimalista */}
      <nav className="mobile-top-nav" id="mobileTopNav">
        <div className="mobile-top-container">
          <Link className="mobile-brand" to="/" onClick={() => setFiltro('todos')}>
            Zéfiro
          </Link>
          
          {/* Buscador en header móvil */}
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

      {/* Barra inferior móvil con 5 iconos Bootstrap */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-container">
          {/* Inicio */}
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

          {/* Catálogo */}
          <Link 
            to="/Catalogo" 
            className={`mobile-nav-item ${activeMobileNav === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('catalog')}
          >
            <i className="bi bi-grid-3x3-gap"></i>
            <span>Catálogo</span>
          </Link>

          {/* Favoritos */}
          <Link 
            to="/favoritos" 
            className={`mobile-nav-item ${activeMobileNav === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('favorites')}
          >
            <i className="bi bi-heart"></i>
            <span>Favoritos</span>
          </Link>

          {/* Pedidos */}
          <Link 
            to="/profile" 
            className={`mobile-nav-item ${activeMobileNav === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveMobileNav('orders')}
          >
            <i className="bi bi-box-seam"></i>
            <span>Pedidos</span>
          </Link>

          {/* Perfil */}
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
            <button onClick={() => setSearchOpen(false)}>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="mobile-search-input"
              />
            </div>
            <button type="submit" className="mobile-search-submit">
              Buscar
            </button>
          </form>
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

      {/* Notificación móvil */}
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
      {/* Solo renderizar Outlet fuera del móvil porque en móvil ya está dentro de MobileNavbar */}
      {!isMobile && <Outlet />}
    </>
  );
};

export default MenuHome;