import React, { useState, useEffect } from "react";
import { Truck, CheckCircle, Clock, XCircle, RefreshCw, Edit3, } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // 1. IMPORTA TU HOOK
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DevolucionFormModal from "../../components/gestiondevoluciones/modals/DevolucionFormModal";
import "../../styles/gestionusuarios/userDevoluciones.css";

// ---  ETIQUETA DE ESTADO ---
const EstadoDevolucion = ({ estado }) => {
  let Icon = Clock;
  let className = "status-pendiente";

  switch (estado) {
    case "Pendiente": Icon = Clock; className = "status-pendiente"; break;
    case "En proceso": Icon = RefreshCw; className = "status-warning"; break;
    case "Aprobada": Icon = CheckCircle; className = "status-success"; break;
    case "Rechazada": Icon = XCircle; className = "status-error"; break;
    case "Completada": Icon = Truck; className = "status-info"; break;
    default: Icon = Clock;
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
  const { idPedido, idProducto } = useParams(); // <--- Captura los datos de la URL
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Usamos estados locales para los datos preseleccionados

  const [pedidosCompletados, setPedidosCompletados] = useState([]);
  const [pedidoPreseleccionado, setPedidoPreseleccionado] = useState(location.state?.pedidoSeleccionado || null);
  const [productoPreseleccionado, setProductoPreseleccionado] = useState(location.state?.productoSeleccionado || null);
  const [devoluciones, setDevoluciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState(null);
  const userRoleActual = user?.idRol === 2 ? "admin" : "cliente";

  // --- NUEVA FUNCIÓN PARA CARGAR PEDIDOS ---
  const fetchPedidosCompletados = async (userId) => {
    const token = localStorage.getItem("authToken")?.replace(/"/g, "");
    try {
      const res = await axios.get(`http://localhost:8080/api/pedidos/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("DATOS DE PEDIDOS RECIBIDOS:", res.data);

      const validos = res.data.filter(p =>
        p.estadoPedido === "Entregado" ||
        p.estadoPedido === "Completado" ||
        p.estadoPedido === "Pendiente"
      );

      console.log("PEDIDOS QUE PASARON EL FILTRO:", validos);
      setPedidosCompletados(validos);
    } catch (error) {
      console.error("Error cargando pedidos para el selector:", error);
    }
  };

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
      const id = user.id || user.idUsuario;
      if (id) {
        fetchPedidosCompletados(id);
        fetchMisDevoluciones();
      }
    }
  }, [user]);

  useEffect(() => {

    if (idPedido) {
      setPedidoPreseleccionado(idPedido);
      if (idProducto) {
        setProductoPreseleccionado(idProducto);
      }
      setIsModalOpen(true);
    }
    // PRIORIDAD 2: Si viene por estado de navegación (Clic interno)
    // Solo limpiar si ya tenemos los datos guardados en nuestros estados locales

    else if (location.state?.pedidoSeleccionado) {
      setPedidoPreseleccionado(location.state.pedidoSeleccionado);
      setProductoPreseleccionado(location.state.productoSeleccionado);
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [idPedido, idProducto, location.state, navigate, location.pathname]);

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
            <th>Pedido</th>
            <th>Producto</th>
            <th>Tipo Solicitud</th>
            <th>Motivo</th>
            <th>Fecha Solicitud</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {devoluciones.map((dev) => {
            // 1. IDs Normalizados
            const idPed = dev.pedido?.idPedido || dev.idPedido;
            const nombreAMostrar = dev.nombreProducto || "Producto";
            const uniqueKey = dev.id_devolucion || dev.idDevolucion || Math.random();

            return (
              <tr key={uniqueKey}>
                <td>{dev.id_devolucion || dev.idDevolucion}</td>
                <td>#{idPed || "N/A"}</td>
               <td >{nombreAMostrar}</td>
                <td>{dev.tipoSolicitud}</td>
                <td className="motivo-cell">{dev.motivo}</td>
                <td>{dev.fechaSolicitud}</td>
                <td><EstadoDevolucion estado={dev.estadoSolicitud} /></td>
                <td>
                  <div className="action-buttons">
                    {dev.estadoSolicitud === "Pendiente" && (
                      <button className="btn-edit" onClick={() => handleOpenModal(dev)} title="Editar solicitud">
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
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
        pedidosCompletados={pedidosCompletados}

        pedido={selectedDevolucion?.pedido?.idPedido || pedidoPreseleccionado?.idPedido || pedidoPreseleccionado || null}
        producto={selectedDevolucion?.producto?.idProducto || productoPreseleccionado?.idProducto || productoPreseleccionado || null}
        userId={user?.id || user?.idUsuario}

      />
    </div>
  );
};

export default UserDevoluciones;