import React, { useState, useEffect } from "react";
import { Truck, CheckCircle, Clock, XCircle, RefreshCw, Eye, Edit3, } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // 1. IMPORTA TU HOOK
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import DevolucionFormModal from "../../components/gestiondevoluciones/modals/DevolucionFormModal";
import "../../styles/gestionusuarios/userDevoluciones.css";

// --- COMPONENTE AUXILIAR: ETIQUETA DE ESTADO ---
const EstadoDevolucion = ({ estado }) => {
  let Icon = Clock;
  let className = "status-pendiente";

  switch (estado) {
    case "Pendiente":
      Icon = Clock;
      className = "status-pendiente";
      break;
    case "En proceso":
      Icon = RefreshCw;
      className = "status-warning";
      break;
    case "Aprobada":
      Icon = CheckCircle;
      className = "status-success";
      break;
    case "Rechazada":
      Icon = XCircle;
      className = "status-error";
      break;
    case "Completada":
      Icon = Truck;
      className = "status-info";
      break;
    default:
      Icon = Clock;
  }

  return (
    <span className={`estado-tag ${className}`}>
      <Icon size={14} style={{ marginRight: "5px" }} />
      {estado}
    </span>
  );
};

// --- COMPONENTE PRINCIPAL ---
const UserDevoluciones = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

// 1. Usamos estados locales para los datos preseleccionados
  const [pedidoPreseleccionado, setPedidoPreseleccionado] = useState(location.state?.pedidoSeleccionado || null);
  const [productoPreseleccionado, setProductoPreseleccionado] = useState(location.state?.productoSeleccionado || null);
  const [devoluciones, setDevoluciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(!!pedidoPreseleccionado);
  const [selectedDevolucion, setSelectedDevolucion] = useState(null);
  const userRoleActual = user?.idRol === 2 ? "admin" : "cliente";

  // Cargar las devoluciones del usuario logueado
  const fetchMisDevoluciones = async () => {
    const token = localStorage.getItem("authToken")?.replace(/"/g, "");

    if (!token) {
      console.error("No hay token disponible");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.get(
        "http://localhost:8080/api/devoluciones/mis-devoluciones",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setDevoluciones(res.data);
    } catch (error) {
      console.error("Error 403 - Detalles:", error.response?.data);
      if (error.response?.status === 403) {
        console.warn("Tu token no tiene permisos o expiró.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMisDevoluciones();
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.pedidoSeleccionado) {
      // Limpiamos la "mochila" de la URL para que al recargar o cerrar no se reabra
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleOpenModal = (dev = null) => {
    if (dev) {
      setSelectedDevolucion(dev);
      // Si editamos, anulamos los preseleccionados de la navegación
      setPedidoPreseleccionado(null);
      setProductoPreseleccionado(null);
    } else {
      setSelectedDevolucion(null);
      // Si es "Crear Nueva" desde el botón superior, no debería tener preseleccionados
      // a menos que tú quieras que se mantengan.
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
   setIsModalOpen(false);
    setSelectedDevolucion(null);
    setPedidoPreseleccionado(null); // Limpiamos para la próxima vez
    setProductoPreseleccionado(null);
  };

  const renderHistorial = () => {
    if (isLoading) {
      return (
        <div className="loading">
          Cargando tu historial de devoluciones... 🔄
        </div>
      );
    }

    if (devoluciones.length === 0) {
      return (
        <div className="no-data">
          <p>No tienes devoluciones registradas hasta el momento.</p>
        </div>
      );
    }

    return (
      <table className="devoluciones-table">
        <thead>
          <tr>
            <th>ID Devolución</th>
            <th>Producto</th>
            <th>Pedido</th>
            <th>Tipo</th>
            <th>Motivo</th>
            <th>Fecha Solicitud</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {devoluciones.map((dev) => (
            <tr key={dev.id_devolucion}>
              <td>{dev.id_devolucion}</td>
              <td>{dev.producto ? dev.producto.nombreProducto : "N/A"}</td>
              <td>{dev.pedido ? `#${dev.pedido.idPedido}` : "N/A"}</td>
              <td>{dev.tipoSolicitud}</td>
              <td className="motivo-cell">{dev.motivo}</td>
              <td>{dev.fechaSolicitud}</td>
              <td>
                <EstadoDevolucion estado={dev.estadoSolicitud} />
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-view"
                    onClick={() => handleOpenModal(dev)}
                    title="Ver detalles"
                  >
                    {" "}
                    <Eye size={16} />{" "}
                  </button>

                  {/* Lógica del controlador: solo editar si está Pendiente */}
                  {dev.estadoSolicitud === "Pendiente" && (
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenModal(dev)}
                      title="Editar solicitud"
                    >
                      {" "}
                      <Edit3 size={16} />{" "}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="devoluciones-container">
      <header className="header-devoluciones">
        <h2>Mis Devoluciones y Cambios 📦</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <CheckCircle size={18} /> Crear Nueva Devolución
        </button>
      </header>

      <div className="tab-content">{renderHistorial()}</div>

      <DevolucionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={() => {
          fetchMisDevoluciones();
          handleCloseModal();
        }}
        devolucionToEdit={selectedDevolucion}
        userRole={userRoleActual}
        pedido={pedidoPreseleccionado}
        producto={productoPreseleccionado}

      />
    </div>
  );
};

export default UserDevoluciones;
