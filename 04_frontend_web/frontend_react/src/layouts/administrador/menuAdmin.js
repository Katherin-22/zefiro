import { useState, useEffect } from "react";
import logo from "../../../src/assets/logo.png";
import "../../../src/styles/administrador/menuAdmin.css";
import { Link, useLocation } from "react-router-dom";



const MenuAdmin = () => {
  const [isClosed, setIsClosed] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detectar la ruta activa
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/Administrador/stock")) setActiveTab("inventario");
    else if (path.includes("/Administrador/Gestion_Pagina")) setActiveTab("pagina");
    else if (path.includes("/Administrador/Usuarios")) setActiveTab("usuarios");
    else if (path.includes("/Administrador/Gestion_Pedido")) setActiveTab("pedidos");
    else if (path.includes("/Administrador/Gestion_Devoluciones")) setActiveTab("devoluciones");
    else if (path.includes("/Administrador/Inbox")) setActiveTab("chat");
  }, [location]);



  // Sidebar para desktop (versión original con IDs)
  const DesktopSidebar = () => (
    <nav id="admin-sidebar" className={`slidebar ${isClosed ? "close" : ""}`}>
      <header id="admin-sidebar-header">
        <div id="admin-logo-container" className="image-text">
          <div id="admin-title-container" className="text header-text">
            <span id="admin-title" className="name">ADMINISTRADOR</span>
          </div>
        </div>

      </header>

      <div id="admin-menu-container" className="menu-bar">
        <div id="admin-main-menu" className="menu">
          <ul id="admin-menu-list" className="menu-links">
            <li id="admin-menu-inventario" className={`nav link ${activeTab === "inventario" ? "active" : ""}`}>
              <Link to="/Administrador/stock" className="admin-menu-link">
                <i className="bi bi-bag-fill admin-menu-icon"></i>
                <span className="text nav-text admin-menu-text">Inventario</span>
              </Link>
            </li>

            <li id="admin-menu-pagina" className={`nav link ${activeTab === "pagina" ? "active" : ""}`}>
              <Link to="/Administrador/Gestion_Pagina" className="admin-menu-link">
                <i className="bi bi-card-heading admin-menu-icon"></i>
                <span className="text nav-text admin-menu-text">Gestionar Página</span>
              </Link>
            </li>

            <li id="admin-menu-usuarios" className={`nav link ${activeTab === "usuarios" ? "active" : ""}`}>
              <Link to="/Administrador/Usuarios" className="admin-menu-link">
                <i className="bi bi-person-rolodex admin-menu-icon"></i>
                <span className="text nav-text admin-menu-text">Gestion Usuarios</span>
              </Link>
            </li>

            <li id="admin-menu-pedidos" className={`nav link ${activeTab === "pedidos" ? "active" : ""}`}>
              <Link to="/Administrador/Gestion_Pedido" className="admin-menu-link">
                <i className="bi bi-box2-fill admin-menu-icon"></i>
                <span className="text nav-text admin-menu-text">Gestion Pedidos</span>
              </Link>
            </li>

            <li id="admin-menu-devoluciones" className={`nav link ${activeTab === "devoluciones" ? "active" : ""}`}>
              <Link to="/Administrador/Gestion_Devoluciones" className="admin-menu-link">
                <i className="bi bi-box-seam admin-menu-icon"></i> 
                <span className="text nav-text admin-menu-text">Gestionar Devoluciones</span>
              </Link>
            </li>

            <li id="admin-menu-chat" className={`nav link ${activeTab === "chat" ? "active" : ""}`}>
              <Link to="/Administrador/Inbox" className="admin-menu-link">
                <i className="bi bi-chat-dots-fill admin-menu-icon"></i>
                <span className="text nav-text admin-menu-text">Chat</span>
              </Link>
            </li>
          </ul>
        </div>

        <div id="admin-bottom-menu" className="botton-content">

          <li id="admin-menu-logout" className="nav link">
            <Link to={"/"} className="admin-menu-link admin-home-link">
              <i className="bi bi-house admin-menu-icon"></i>
              <span className="text nav-text admin-menu-text">Página Principal</span>
            </Link>
          </li>

          <li id="admin-menu-logout" className="nav link">
            <Link onClick={() => {
              localStorage.clear()
              window.location.href = '/loginpage';
             }}  className="admin-menu-link admin-logout-link">
              <i className="bi bi-door-closed admin-menu-icon"></i>
              <span className="text nav-text admin-menu-text">Cerrar sesión</span>
            </Link>
          </li>
        </div>
      </div>
    </nav>
  );

  // Menú inferior para móvil (5 iconos con IDs)
  const MobileBottomNav = () => (
    <>
      {/* Barra inferior fija con 5 opciones */}
      <nav id="admin-mobile-nav" className="admin-mobile-bottom-nav">
        <div id="admin-mobile-nav-container" className="admin-mobile-nav-container">
          
          {/* Inventario */}
          <Link 
            id="mobile-nav-inventario"
            to="/Administrador/stock" 
            className={`admin-mobile-nav-item ${activeTab === "inventario" ? "active" : ""}`}
            onClick={() => setActiveTab("inventario")}
          >
            <i className="bi bi-bag-fill mobile-nav-icon"></i>
            <span className="mobile-nav-text">Inventario</span>
          </Link>

          {/* Usuarios */}
          <Link 
            id="mobile-nav-usuarios"
            to="/Administrador/Usuarios" 
            className={`admin-mobile-nav-item ${activeTab === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveTab("usuarios")}
          >
            <i className="bi bi-person-rolodex mobile-nav-icon"></i>
            <span className="mobile-nav-text">Usuarios</span>
          </Link>

          {/* Pedidos */}
          <Link 
            id="mobile-nav-pedidos"
            to="/Administrador/Gestion_Pedido" 
            className={`admin-mobile-nav-item ${activeTab === "pedidos" ? "active" : ""}`}
            onClick={() => setActiveTab("pedidos")}
          >
            <i className="bi bi-box2-fill mobile-nav-icon"></i>
            <span className="mobile-nav-text">Pedidos</span>
          </Link>

          {/* Chat */}
          <Link 
            id="mobile-nav-chat"
            to="/Administrador/Inbox" 
            className={`admin-mobile-nav-item ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <i className="bi bi-chat-dots-fill mobile-nav-icon"></i>
            <span className="mobile-nav-text">Chat</span>
          </Link>

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
              <span className="mobile-nav-text">Más</span>
            </button>
            
            <div id="mobile-dropdown-menu" className="admin-mobile-dropdown-menu">
              <Link 
                id="dropdown-pagina"
                to="/Administrador/Gestion_Pagina" 
                className="dropdown-item"
                onClick={() => {
                  setActiveTab("pagina");
                  document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                }}
              >
                <i className="bi bi-card-heading dropdown-icon"></i>
                <span className="dropdown-text">Gestionar Página</span>
              </Link>
              
              <Link 
                id="dropdown-devoluciones"
                to="/Administrador/Gestion_Devoluciones" 
                className="dropdown-item"
                onClick={() => {
                  setActiveTab("devoluciones");
                  document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                }}
              >
                <i className="bi bi-box-seam dropdown-icon"></i>
                <span className="dropdown-text">Devoluciones</span>
              </Link>
              
              <hr id="dropdown-divider" className="dropdown-divider" />
              
                            <Link 
                id="dropdown-devoluciones"
                to="/" 
                className="dropdown-item"
                onClick={() => {
                  setActiveTab("devoluciones");
                  document.querySelector('.admin-mobile-dropdown')?.classList.remove('show');
                }}
              >
                <i className="bi bi-house dropdown-icon"></i>
                <span className="dropdown-text">Página Principal</span>
              </Link>

              <Link 
                id="dropdown-logout"
                to="/" 
                className="dropdown-item logout"
                onClick={() => document.querySelector('.admin-mobile-dropdown')?.classList.remove('show')}
              >
                <i className="bi bi-door-closed dropdown-icon"></i>
                <span  onClick={() => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/loginpage';}
} className="dropdown-text">Cerrar sesión</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );

  // Retornamos el componente apropiado según el dispositivo
  return (
    <>
      {isMobile ? <MobileBottomNav /> : <DesktopSidebar />}
    </>
  );
};

export default MenuAdmin;