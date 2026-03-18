import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useFiltro } from "../../utils/FiltroContextx";
import { useCart } from '../../components/carrito/CarritoContext';
import { useResponsive } from "../../hooks/responsive/responsive";
import useAuth from "../../hooks/token/useAuth";
import "../../styles/home/menuHome.css";
import "../../styles/home/menuMobile.css";

// Componente separado para el input de búsqueda DESKTOP
const SearchInputDesktop = ({ onSearch, initialValue = '' }) => {
    const [query, setQuery] = useState(initialValue);
    const [activeTab, setActiveTab] = useState("");
    const location = useLocation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setQuery('');
        }
    };

    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/Administrador/Dashboard")) setActiveTab("Dashboard");
        else if (path.includes("perfilUsuario")) setActiveTab("Actualizar perfil");
    }, [location]);

    const handleClear = () => {
        setQuery('');
    };

    return (
        <form onSubmit={handleSubmit} className="w-100">
            <div className="input-group">
                <input
                    className="form-control"
                    id="navBarHome-search-input"
                    type="text"
                    placeholder="Buscar productos..."
                    aria-label="Buscar"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    style={{
                        outline: 'none',
                        boxShadow: 'none',
                        border: '1px solid #6c757d',
                        borderRight: 'none'
                    }}
                />
                <button
                    className="btn btn-outline-light"
                    id="navBarHome-search-btn"
                    type="submit"
                    disabled={!query.trim()}
                    style={{
                        border: '1px solid #6c757d',
                        borderLeft: 'none'
                    }}
                >
                    <i className="bi bi-search"></i>
                </button>
                {query && (
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={handleClear}
                        style={{
                            border: '1px solid #6c757d',
                            borderLeft: 'none'
                        }}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                )}
            </div>
        </form>
    );
};

// Componente separado para el modal de búsqueda MOBILE - VERSIÓN CORREGIDA
const MobileSearchModal = ({ isOpen, onClose, onSearch }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const modalRef = useRef(null);
    const wasOpen = useRef(false);

    useEffect(() => {
        if (isOpen) {
            wasOpen.current = true;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setQuery('');
            onClose();
        }
    };

    const handleClear = () => {
        setQuery('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!isOpen && !wasOpen.current) return null;
    if (!isOpen && wasOpen.current) {
        wasOpen.current = false;
        return null;
    }

    return (
        <div
            className="mobile-search-modal"
            onClick={handleOverlayClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 1050,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '20vh'
            }}
        >
            <div
                ref={modalRef}
                className="mobile-search-content"
                onClick={handleContentClick}
                style={{
                    background: 'white',
                    width: '90%',
                    maxWidth: '500px',
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative'
                }}
            >
                <div className="mobile-search-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h5 style={{ margin: 0 }}>Buscar productos</h5>
                    <button
                        onClick={onClose}
                        type="button"
                        aria-label="Cerrar"
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '5px'
                        }}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mobile-search-form">
                    <div className="mobile-search-input-container" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #007bff', marginBottom: '20px' }}>
                        <i className="bi bi-search" style={{ color: '#666', marginRight: '10px' }}></i>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="mobile-search-input"
                            style={{
                                fontSize: '16px',
                                border: 'none',
                                background: 'transparent',
                                padding: '15px 0',
                                flex: 1,
                                outline: 'none'
                            }}
                            autoComplete="off"
                        />
                        {query && (
                            <button
                                type="button"
                                className="mobile-search-clear"
                                onClick={handleClear}
                                aria-label="Limpiar búsqueda"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>

                    {/* Sugerencias de categorías */}
                    <div className="mobile-search-suggestions" style={{ marginBottom: '20px' }}>
                        <h6 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>Categorías populares</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    onSearch('Mujer');
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="bi bi-gender-female" style={{ color: '#e83e8c' }}></i>
                                <span>Mujer</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onSearch('Hombre');
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="bi bi-gender-male" style={{ color: '#007bff' }}></i>
                                <span>Hombre</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mobile-search-submit"
                        disabled={!query.trim()}
                        style={{
                            width: '100%',
                            background: !query.trim() ? '#6c757d' : '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '15px',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: !query.trim() ? 'not-allowed' : 'pointer',
                            opacity: !query.trim() ? 0.65 : 1
                        }}
                    >
                        Buscar
                    </button>
                </form>
            </div>
        </div>
    );
};

const MenuHome = () => {
    const { setFiltro } = useFiltro();
    const navigate = useNavigate();
    const location = useLocation();
    const { isMobile } = useResponsive();
    const { isAuthenticated, userData, logout } = useAuth();
    const { totalItems, clearCart } = useCart();

    // ✅ Obtener userId de forma segura (maneja ambos formatos)
    const userId = userData?.id || userData?.idUsuario || null;

    const [activeMobileNav, setActiveMobileNav] = useState('home');
    const [notification, setNotification] = useState(null);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    // Detectar ruta activa
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveMobileNav('home');
        else if (path === '/catalogo' || path.includes('/catalogo')) setActiveMobileNav('catalog');
        else if (path === '/favoritos') setActiveMobileNav('favorites');
        else if (path === '/carrito') setActiveMobileNav('cart');
        else if (path.includes('/pedidos/')) setActiveMobileNav('orders');
        else if (path.includes('/perfilUsuario') || path === '/loginpage') setActiveMobileNav('profile');
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

    // Función de búsqueda
    const handleSearch = (query) => {
        if (query.trim()) {
            console.log("🔍 Buscando:", query);
            navigate(`/Catalogo?search=${encodeURIComponent(query)}`);
            showNotification(`Buscando: ${query}`);
        }
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        logout();
        clearCart();
        navigate('/loginpage');
        showNotification('Sesión cerrada');
    };

    // Desktop Navbar
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

                    {/* BÚSQUEDA - COMPONENTE SEPARADO */}
                    <div className="d-flex me-3">
                        <SearchInputDesktop onSearch={handleSearch} />
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
                                {isAuthenticated && userData?.nombre && (
                                    <span className="ms-1 d-none d-md-inline">
                                        {userData.nombre}
                                    </span>
                                )}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" id="navBarHome-profile-menu">
                                {!isAuthenticated ? (
                                    // USUARIO NO AUTENTICADO - SOLO BOTÓN DE INICIAR SESIÓN
                                    <li><Link className="dropdown-item" id="navBarHome-login" to="/loginpage">Iniciar sesión</Link></li>
                                ) : (
                                    // USUARIO AUTENTICADO
                                    <>
                                        <li className="dropdown-header">
                                            <small className="text-muted">Bienvenido</small>
                                            <div className="fw-bold">{userData?.nombre || 'Usuario'}</div>
                                            <small className="text-muted">{userData?.email || ''}</small>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <Link 
                                                className="dropdown-item" 
                                                id="navBarHome-profile" 
                                                to={`/perfilUsuario/${userId || ''}`}
                                            >
                                                <i className="bi bi-person me-2"></i>Perfil
                                            </Link>
                                        </li>
                                        <li>
                                            {userId ? (
                                                <Link 
                                                    className="dropdown-item" 
                                                    id="navBarHome-orders" 
                                                    to={`/pedidos/${userId}`}
                                                >
                                                    <i className="bi bi-box-seam me-2"></i>Pedidos
                                                </Link>
                                            ) : (
                                                <Link 
                                                    className="dropdown-item" 
                                                    id="navBarHome-orders" 
                                                    to="/loginpage"
                                                >
                                                    <i className="bi bi-box-seam me-2"></i>Inicia sesión para ver pedidos
                                                </Link>
                                            )}
                                        </li>
                                        {/* Dashboard solo para administradores */}
                                        {userData?.rol === 2 && (
                                            <li><Link className="dropdown-item" id="navBarHome-dashboard" to="/Administrador/Dashboard">
                                                <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                            </Link></li>
                                        )}
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger"
                                                id="navBarHome-logout"
                                                onClick={handleLogout}
                                            >
                                                <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </li>

                        {/* FAVORITOS - Solo mostrar si está autenticado */}
                        {userData?.rol === 1 && isAuthenticated ? (
                            <li className="nav-item" id="navBarHome-favorites-item">
                                <Link className="nav-link" id="navBarHome-favorites-link" to="/favoritos">
                                    <i className="bi bi-heart-fill" id="navBarHome-favorites-icon"></i>
                                </Link>
                            </li>
                        ) : null}

                        <li className="nav-item" id="navBarHome-cart-item">
                            <Link className="nav-link" id="navBarHome-cart-link" to="/carrito">
                                <i className="bi bi-cart-fill" id="navBarHome-cart-icon"></i>
                                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );

    // Mobile Navbar
    const MobileNavbar = () => {
        const openMobileSearch = () => {
            setMobileSearchOpen(true);
        };

        const closeMobileSearch = () => {
            setMobileSearchOpen(false);
        };

        const handleMobileSearch = (query) => {
            handleSearch(query);
            closeMobileSearch();
        };

        return (
            <>
                <nav className="mobile-top-nav" id="mobileTopNav">
                    <div className="mobile-top-container">
                        <Link className="mobile-brand" to="/" onClick={() => handleFiltro('todos')}>
                            Zéfiro
                        </Link>

                        <div className="mobile-header-search">
                            <button
                                className="mobile-search-btn"
                                onClick={openMobileSearch}
                                type="button"
                            >
                                <i className="bi bi-search"></i>
                            </button>

                            <Link to="/carrito" className="mobile-cart-btn">
                                <i className="bi bi-cart-fill"></i>
                                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
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
                                handleFiltro('todos');
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

                        {/* Link a pedidos con validación */}
                        {userId ? (
                            <Link
                                to={`/pedidos/${userId}`}
                                className={`mobile-nav-item ${activeMobileNav === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveMobileNav('orders')}
                            >
                                <i className="bi bi-box-seam"></i>
                                <span>Pedidos</span>
                            </Link>
                        ) : (
                            <Link
                                to="/loginpage"
                                className={`mobile-nav-item`}
                                onClick={() => setActiveMobileNav('profile')}
                            >
                                <i className="bi bi-box-seam"></i>
                                <span>Pedidos</span>
                            </Link>
                        )}

                        {/* Más opciones (dropdown) */}
                        <div id="mobile-nav-more" className="admin-mobile-nav-item admin-mobile-dropdown">
                            <button 
                                id="mobile-more-btn"
                                className="admin-mobile-dropdown-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const dropdown = e.currentTarget.parentElement;
                                    dropdown.classList.toggle("show");
                                }}
                            >
                                <i className="bi bi-three-dots mobile-nav-icon"></i>
                                <span className="mobile-nav-text">Perfil</span>
                            </button>
                            
                            {!isAuthenticated ? (
                                // USUARIO NO AUTENTICADO
                                <div id="mobile-dropdown-menu" className="admin-mobile-dropdown-menu">
                                    <Link 
                                        id="dropdown-pagina"
                                        to="/loginpage" 
                                        className="dropdown-item"
                                        onClick={() => {
                                            document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                                        }}
                                    >
                                        <i className="bi bi-card-heading dropdown-icon"></i>
                                        <span className="dropdown-text">Iniciar sesión</span>
                                    </Link>
                                </div>    
                            ) : (
                                // USUARIO AUTENTICADO
                                <div id="mobile-dropdown-menu" className="admin-mobile-dropdown-menu">
                                    <Link 
                                        id="dropdown-pagina"
                                        to={`/perfilUsuario/${userId || ''}`}
                                        className="dropdown-item"
                                        onClick={() => {
                                            document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                                        }}
                                    >
                                        <i className="bi bi-card-heading dropdown-icon"></i>
                                        <span className="dropdown-text">Actualizar perfil</span>
                                    </Link>

                                    {userData?.rol === 2 && (   
                                        <Link 
                                            id="dropdown-devoluciones"
                                            to="/Administrador/Dashboard" 
                                            className="dropdown-item"
                                            onClick={() => {
                                                document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                                            }}
                                        >
                                            <i className="bi bi-box-seam dropdown-icon"></i>
                                            <span className="dropdown-text">Dashboard</span>
                                        </Link>
                                    )}

                                    <Link 
                                        id="dropdown-logout"
                                        to="/" 
                                        className="dropdown-item logout"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                                            handleLogout();
                                        }}
                                    >
                                        <i className="bi bi-door-closed dropdown-icon"></i>
                                        <span className="dropdown-text">Cerrar sesión</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* MODAL DE BÚSQUEDA MOBILE */}
                <MobileSearchModal
                    isOpen={mobileSearchOpen}
                    onClose={closeMobileSearch}
                    onSearch={handleMobileSearch}
                />

                {notification && (
                    <div className="mobile-notification">
                        <i className="bi bi-check-circle"></i>
                        <span>{notification}</span>
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
            {!isMobile && <Outlet />}
        </>
    );
};

export default MenuHome;