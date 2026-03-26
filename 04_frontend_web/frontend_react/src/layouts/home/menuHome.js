import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useFiltro } from "../../utils/FiltroContextx";
import { useCart } from "../../components/carrito/CarritoContext";
import { useResponsive } from "../../hooks/responsive/responsive";
import useAuth from "../../hooks/token/useAuth";
import "../../styles/home/menuHome.css";
import "../../styles/home/menuMobile.css";

// Componente separado para el input de búsqueda DESKTOP
const SearchInputDesktop = ({ onSearch, initialValue = "" }) => {
  const [query, setQuery] = useState(initialValue);
  const [activeTab, setActiveTab] = useState("");
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery("");
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/Administrador/Dashboard")) setActiveTab("Dashboard");
    else if (path.includes("perfilUsuario")) setActiveTab("Actualizar perfil");
  }, [location]);

  const handleClear = () => {
    setQuery("");
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
            outline: "none",
            boxShadow: "none",
            border: "1px solid #6c757d",
            borderRight: "none",
          }}
        />
        <button
          className="btn btn-outline-light"
          id="navBarHome-search-btn"
          type="submit"
          disabled={!query.trim()}
          style={{
            border: "1px solid #6c757d",
            borderLeft: "none",
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
              border: "1px solid #6c757d",
              borderLeft: "none",
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>
    </form>
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

  const [activeMobileNav, setActiveMobileNav] = useState("home");
  const [notification, setNotification] = useState(null);

  // Detectar ruta activa
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setActiveMobileNav("home");
    else if (path === "/catalogo" || path.includes("/catalogo"))
      setActiveMobileNav("catalog");
    else if (path === "/favoritos") setActiveMobileNav("favorites");
    else if (path === "/carrito") setActiveMobileNav("cart");
    else if (path.includes("/pedidos/")) setActiveMobileNav("orders");
    else if (path.includes("/perfilUsuario") || path === "/loginpage")
      setActiveMobileNav("profile");
  }, [location]);

  const handleFiltro = (nuevoFiltro) => {
    console.log("🔄 Cambiando filtro a:", nuevoFiltro);
    setFiltro(nuevoFiltro);
    navigate("/Catalogo");
    if (isMobile) {
      setActiveMobileNav("catalog");
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Función de búsqueda (solo desktop)
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
    navigate("/loginpage");
    showNotification("Sesión cerrada");
  };

  // Desktop Navbar
  const DesktopNavbar = () => (
    <nav
      className="navbar fixed-top navbar-expand-lg"
      id="navBarHome"
      data-bs-theme="dark"
    >
      <div className="container-fluid" id="navBarHome-container">
        <Link
          className="navbar-brand"
          id="navBarHome-brand"
          to="/"
          onClick={() => setFiltro("todos")}
        >
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
          <span
            className="navbar-toggler-icon"
            id="navBarHome-toggler-icon"
          ></span>
        </button>

        <div className="collapse navbar-collapse" id="navBarHome-content">
          <ul
            className="navbar-nav me-auto mb-2 mb-lg-0"
            id="navBarHome-mainMenu"
          >
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
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleFiltro("calzado")}
                  >
                    Todo el Calzado
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleFiltro("Mujer")}
                  >
                    Para Mujer
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleFiltro("Hombre")}
                  >
                    Para Hombre
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleFiltro("nino")}
                  >
                    Para Niño
                  </button>
                </li>
              </ul>
            </li>

            <li className="nav-item" id="navBarHome-bolsos-item">
              <button
                className="nav-link btn btn-link"
                id="navBarHome-bolsos-btn"
                onClick={() => handleFiltro("bolsos")}
              >
                Bolsos
              </button>
            </li>

            <li className="nav-item" id="navBarHome-novedades-item">
              <button
                className="nav-link btn btn-link"
                id="navBarHome-novedades-btn"
                onClick={() => handleFiltro("todos")}
              >
                Novedades
              </button>
            </li>
          </ul>

          {/* BÚSQUEDA - SOLO DESKTOP */}
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
                <i
                  className="bi bi-person-fill"
                  id="navBarHome-profile-icon"
                ></i>
                {isAuthenticated && userData?.nombre && (
                  <span className="ms-1 d-none d-md-inline">
                    {userData.nombre}
                  </span>
                )}
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                id="navBarHome-profile-menu"
              >
                {!isAuthenticated ? (
                  // USUARIO NO AUTENTICADO - SOLO BOTÓN DE INICIAR SESIÓN
                  <li>
                    <Link
                      className="dropdown-item"
                      id="navBarHome-login"
                      to="/loginpage"
                    >
                      Iniciar sesión
                    </Link>
                  </li>
                ) : (
                  // USUARIO AUTENTICADO
                  <>
                    <li className="dropdown-header">
                      <small className="text-muted">Bienvenido</small>
                      <div className="fw-bold">
                        {userData?.nombre || "Usuario"}
                      </div>
                      <small className="text-muted">
                        {userData?.email || ""}
                      </small>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        id="navBarHome-profile"
                        to={`/perfilUsuario/${userId || ""}`}
                      >
                        <i className="bi bi-person me-2"></i>Perfil
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        id="navBarHome-profile"
                        to="/mis-devoluciones"
                      >
                        <i className="bi bi-person me-2"></i>Mis Devoluciones
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
                          <i className="bi bi-box-seam me-2"></i>Inicia sesión
                          para ver pedidos
                        </Link>
                      )}
                    </li>
                    {/* Dashboard solo para administradores */}
                    {userData?.rol === 2 && (
                      <li>
                        <Link
                          className="dropdown-item"
                          id="navBarHome-dashboard"
                          to="/Administrador/Dashboard"
                        >
                          <i className="bi bi-speedometer2 me-2"></i>Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        id="navBarHome-logout"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Cerrar
                        sesión
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </li>

            {/* FAVORITOS - Solo mostrar si está autenticado */}
            {isAuthenticated ? (
              <li className="nav-item" id="navBarHome-favorites-item">
                <Link
                  className="nav-link"
                  id="navBarHome-favorites-link"
                  to="/favoritos"
                >
                  <i
                    className="bi bi-heart-fill"
                    id="navBarHome-favorites-icon"
                  ></i>
                </Link>
              </li>
            ) : null}

            <li className="nav-item" id="navBarHome-cart-item">
              <Link
                className="nav-link"
                id="navBarHome-cart-link"
                to="/carrito"
              >
                <i className="bi bi-cart-fill" id="navBarHome-cart-icon"></i>
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );

  // Mobile Navbar - SIN BOTÓN DE BÚSQUEDA
  const MobileNavbar = () => {
    return (
      <>
        <nav className="mobile-top-nav" id="mobileTopNav">
          <div className="mobile-top-container">
            <Link
              className="mobile-brand"
              to="/"
              onClick={() => handleFiltro("todos")}
            >
              Zéfiro
            </Link>

            <div className="mobile-header-search">
              {/* BOTÓN DE BÚSQUEDA ELIMINADO - ESPACIO LIBERADO */}

              <Link
                className="nav-link btn btn-link"
                id="navBarHome-bolsos-btn"
                to="/home/catalogo"
              >
                Catalogo
              </Link>

              <Link to="/carrito" className="mobile-cart-btn">
                <i className="bi bi-cart-fill"></i>
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            </div>
          </div>
        </nav>

        <nav className="mobile-bottom-nav">
          <div className="mobile-nav-container">
            <Link
              to="/"
              className={`mobile-nav-item ${activeMobileNav === "home" ? "active" : ""}`}
              onClick={() => {
                setActiveMobileNav("home");
                handleFiltro("todos");
              }}
            >
              <i className="bi bi-house"></i>
              <span>Inicio</span>
            </Link>

            <Link
              to="/categorias-mobile"
              className={`mobile-nav-item ${activeMobileNav === "catalog" ? "active" : ""}`}
              onClick={() => setActiveMobileNav("catalog")}
            >
              <i className="bi bi-grid-3x3-gap"></i>
              <span>categorias</span>
            </Link>
            {/* FAVORITOS - Solo para clientes autenticados (rol 1) */}
            {isAuthenticated && (
              <Link
                to="/favoritos"
                className={`mobile-nav-item ${activeMobileNav === "favorites" ? "active" : ""}`}
                onClick={() => setActiveMobileNav("favorites")}
              >
                <i className="bi bi-heart"></i>
                <span>Favoritos</span>
              </Link>
            )}

            {/* Link a pedidos con validación */}
            {userId ? (
              <Link
                to={`/pedidos/${userId}`}
                className={`mobile-nav-item ${activeMobileNav === "orders" ? "active" : ""}`}
                onClick={() => setActiveMobileNav("orders")}
              >
                <i className="bi bi-box-seam"></i>
                <span>Pedidos</span>
              </Link>
            ) : (
              <Link
                to="/loginpage"
                className={`mobile-nav-item`}
                onClick={() => setActiveMobileNav("profile")}
              >
                <i className="bi bi-box-seam"></i>
                <span>Pedidos</span>
              </Link>
            )}

            {/* Más opciones (dropdown) */}
            <div
              id="mobile-nav-more"
              className="admin-mobile-nav-item admin-mobile-dropdown"
            >
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
                <div
                  id="mobile-dropdown-menu"
                  className="admin-mobile-dropdown-menu"
                >
                  <Link
                    id="dropdown-pagina"
                    to="/loginpage"
                    className="dropdown-item"
                    onClick={() => {
                      document
                        .querySelector(".admin-mobile-dropdown")
                        ?.classList.remove("show");
                    }}
                  >
                    <i className="bi bi-card-heading dropdown-icon"></i>
                    <span className="dropdown-text">Iniciar sesión</span>
                  </Link>
                </div>
              ) : (
                // USUARIO AUTENTICADO
                <div
                  id="mobile-dropdown-menu"
                  className="admin-mobile-dropdown-menu"
                >
                  <Link
                    id="dropdown-devoluciones"
                    to="/mis-devoluciones"
                    className="dropdown-item"
                    onClick={() => {
                      document
                        .querySelector(".admin-mobile-dropdown")
                        ?.classList.remove("show");
                    }}
                  >
                    <i className="bi bi-arrow-return-left dropdown-icon"></i>
                    <span className="dropdown-text">Mis Devoluciones</span>
                  </Link>
                  <Link
                    id="dropdown-pagina"
                    to={`/perfilUsuario/${userId || ""}`}
                    className="dropdown-item"
                    onClick={() => {
                      document
                        .querySelector(".admin-mobile-dropdown")
                        ?.classList.remove("show");
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
                        document
                          .querySelector(".admin-mobile-dropdown")
                          ?.classList.remove("show");
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
                      document
                        .querySelector(".admin-mobile-dropdown")
                        ?.classList.remove("show");
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
