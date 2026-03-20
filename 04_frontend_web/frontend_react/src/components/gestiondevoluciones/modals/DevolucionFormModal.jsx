import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { ESTADOS, TIPOS_SOLICITUD } from "../constants/devolucionesConstants";
import { useAuth } from "../../../context/AuthContext"; // ← IMPORTAR EL HOOK
import "../../../styles/home/pedidosUsuario.css"

const DevolucionFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  devolucionToEdit, 
  userRole = "cliente", 
  pedido, 
  producto,
  userIdFromProps // ← ID del usuario recibido desde el botón
}) => {
  const { user } = useAuth(); // ← OBTENER EL USUARIO DEL CONTEXTO
  const isClient = userRole === "cliente";
  
  // Estado para el ID del usuario actual
  const [currentUserId, setCurrentUserId] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    motivo: "",
    tipoSolicitud: TIPOS_SOLICITUD[0],
    estadoSolicitud: ESTADOS[0],
    fechaSolicitud: new Date().toISOString().substring(0, 10),
    fechaRespuesta: null,
    idUsuario: "",
    idProducto: "",
    idPedido: "",
  });

  const [isError, setIsError] = useState("");
  const [message, setMessage] = useState("");

  // Obtener ID del usuario de múltiples fuentes
  useEffect(() => {
    // 1. Prioridad 1: userIdFromProps (enviado desde el botón)
    if (userIdFromProps) {
      console.log("✅ Usando userIdFromProps:", userIdFromProps);
      setCurrentUserId(userIdFromProps);
      return;
    }

    // 2. Prioridad 2: user del contexto
    if (user) {
      console.log("👤 Usuario desde contexto:", user);
      // Buscar el ID en diferentes campos posibles
      const userId = user?.id || user?.idUsuario || user?.userId;
      if (userId) {
        console.log("✅ ID encontrado en contexto:", userId);
        setCurrentUserId(userId);
        return;
      }
    }

    // 3. Prioridad 3: localStorage (como fallback)
    console.log("🔍 Buscando en localStorage...");
    const userDataStr = localStorage.getItem("userData"); // ← CORREGIDO: userData no user
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log("📦 userData desde localStorage:", userData);
        const userId = userData?.id || userData?.idUsuario || userData?.userId;
        if (userId) {
          console.log("✅ ID encontrado en localStorage:", userId);
          setCurrentUserId(userId);
          return;
        }
      } catch (e) {
        console.error("Error parsing userData:", e);
      }
    }

    console.log("❌ No se pudo encontrar el ID del usuario");
  }, [user, userIdFromProps]);

  useEffect(() => {
    if (!isOpen) {
      setIsError("");
      setMessage("");
      return;
    }

    console.log("📦 Props recibidas:", { 
      devolucionToEdit, 
      pedido, 
      producto, 
      userIdFromProps,
      currentUserId 
    });

    // CASO 1: EDITAR DEVOLUCIÓN EXISTENTE
    if (devolucionToEdit) {
      setFormData({
        id: devolucionToEdit.id_devolucion,
        motivo: devolucionToEdit.motivo || "",
        tipoSolicitud: devolucionToEdit.tipoSolicitud || TIPOS_SOLICITUD[0],
        estadoSolicitud: devolucionToEdit.estadoSolicitud || ESTADOS[0],
        fechaSolicitud: devolucionToEdit.fechaSolicitud 
          ? (devolucionToEdit.fechaSolicitud.includes('T') 
              ? devolucionToEdit.fechaSolicitud.split('T')[0] 
              : devolucionToEdit.fechaSolicitud.substring(0, 10))
          : new Date().toISOString().substring(0, 10),
        fechaRespuesta: devolucionToEdit.fechaRespuesta || null,
        idUsuario: devolucionToEdit.usuario?.idUsuario || currentUserId || userIdFromProps || "",
        idProducto: devolucionToEdit.producto?.idProducto || "",
        idPedido: devolucionToEdit.pedido?.idPedido || "",
      });
    } 
    // CASO 2: NUEVA DEVOLUCIÓN DESDE "MIS PEDIDOS"
    else if (pedido || producto) {
      const idPedFinal = pedido?.idPedido || pedido?.id || "";
      const idProdFinal = producto?.idProducto || producto?.id || "";

      setFormData({
        id: null,
        motivo: "",
        tipoSolicitud: TIPOS_SOLICITUD[0],
        estadoSolicitud: "Pendiente",
        fechaSolicitud: new Date().toISOString().substring(0, 10),
        fechaRespuesta: null,
        idUsuario: currentUserId || userIdFromProps || "", // Usar el ID encontrado
        idProducto: idProdFinal,
        idPedido: idPedFinal,
      });
    }
  }, [isOpen, devolucionToEdit, pedido, producto, userIdFromProps, currentUserId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError("");
    setMessage("");

    // Validaciones básicas
    if (!formData.motivo.trim()) {
      setIsError("❌ El motivo de la solicitud es obligatorio.");
      return;
    }

    const idPedFinal = formData.idPedido ? Number(formData.idPedido) : null;
    const idProdFinal = formData.idProducto ? Number(formData.idProducto) : null;

    if (!idPedFinal || !idProdFinal) {
      setIsError("❌ Error: No se ha detectado el pedido o producto.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      if (!token) {
        setIsError("No se encontró el token de autenticación.");
        return;
      }

      // Formato de fecha con hora para el backend
      const now = new Date();
      const fechaHoraActual = now.toISOString().slice(0, 19).replace('T', ' ');
      
      // Determinar el ID de usuario a enviar
      let userIdToSend = null;
      
      if (isClient) {
        // Cliente: usar el ID de currentUserId o userIdFromProps
        userIdToSend = currentUserId || userIdFromProps;
        
        if (!userIdToSend) {
          setIsError("❌ No se pudo determinar el ID del usuario.");
          return;
        }
        
        // Asegurar que sea número
        userIdToSend = Number(userIdToSend);
        if (isNaN(userIdToSend)) {
          setIsError("❌ El ID de usuario no es válido.");
          return;
        }
      } else {
        // Admin: usar el ID proporcionado en el formulario
        userIdToSend = formData.idUsuario ? Number(formData.idUsuario) : null;
        if (!userIdToSend) {
          setIsError("❌ El ID de usuario es obligatorio.");
          return;
        }
      }

      // Construir payload
      const payload = {
        motivo: formData.motivo,
        tipoSolicitud: formData.tipoSolicitud,
        estadoSolicitud: isClient ? 'Pendiente' : formData.estadoSolicitud,
        fechaSolicitud: formData.fechaSolicitud 
          ? `${formData.fechaSolicitud} 00:00:00`
          : fechaHoraActual,
        fechaRespuesta: isClient || formData.estadoSolicitud === 'Pendiente' 
          ? null 
          : (formData.fechaRespuesta ? `${formData.fechaRespuesta} 00:00:00` : fechaHoraActual),
        idProducto: idProdFinal,
        idPedido: idPedFinal,
        idUsuario: userIdToSend,
      };

      console.log("🚀 Payload listo para enviar:", payload);

      let response;
      if (devolucionToEdit) {
        const devolucionId = devolucionToEdit.id_devolucion;
        response = await axios.put(
          `http://35.171.131.177:8080/api/devoluciones/${devolucionId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        setMessage("✅ Devolución actualizada correctamente.");
      } else {
        response = await axios.post(
          "http://35.171.131.177:8080/api/devoluciones",
          payload,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        setMessage("✅ ¡Devolución creada exitosamente!");
      }

      console.log("✅ Respuesta del servidor:", response.data);
      onSave();
      setTimeout(() => onClose(), 1200);

    } catch (err) {
      console.error("❌ Error completo:", err.response || err);
      
      if (err.response?.data?.error) {
        setIsError(`❌ ${err.response.data.error}`);
      } else if (err.response?.data?.message) {
        setIsError(`❌ ${err.response.data.message}`);
      } else if (err.response?.data?.errorMessage) {
        setIsError(`❌ ${err.response.data.errorMessage}`);
      } else {
        setIsError("❌ Error al conectar con el servidor.");
      }
    }
  };

  return (
    <div className="admin2-theme">
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h3>{devolucionToEdit ? "Editar Devolución" : "Registrar Nueva Devolución"}</h3>
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group full-width">
              <label>Motivo *</label>
              <textarea 
                name="motivo" 
                value={formData.motivo} 
                onChange={handleChange} 
                rows="3" 
                required 
                placeholder="Ej: Cambio de talla, producto dañado, etc." 
              />
            </div>

            <div className="form-group">
              <div className="field">
                <label>Tipo de Solicitud *</label>
                <select name="tipoSolicitud" value={formData.tipoSolicitud} onChange={handleChange} required>
                  {TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {!isClient && (
                <div className="field">
                  <label>Estado de la Solicitud *</label>
                  <select name="estadoSolicitud" value={formData.estadoSolicitud} onChange={handleChange} required>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Visualización informativa para el cliente */}
            {isClient && !devolucionToEdit && (
              <div className="info-preseleccion" style={{ 
                background: '#f0f7ff', 
                padding: '10px', 
                borderRadius: '5px', 
                marginBottom: '15px', 
                fontSize: '0.9rem', 
                border: '1px solid #d0e7ff' 
              }}>
                <p style={{ margin: '2px 0' }}>
                  <strong>Pedido:</strong> #{formData.idPedido || "No detectado"}
                </p>
                <p style={{ margin: '2px 0' }}>
                  <strong>Producto ID:</strong> {formData.idProducto || "No detectado"}
                </p>
                <p style={{ margin: '2px 0', color: '#0066cc', fontWeight: 'bold' }}>
                  <strong>Tu ID de usuario:</strong> {currentUserId || userIdFromProps || "No detectado"}
                </p>
              </div>
            )}

            <input type="hidden" name="idPedido" value={formData.idPedido} />
            <input type="hidden" name="idProducto" value={formData.idProducto} />

            {!isClient && (
              <div className="form-group">
                <div className="field">
                  <label>ID de Usuario *</label>
                  <input 
                    type="number" 
                    name="idUsuario" 
                    value={formData.idUsuario} 
                    onChange={handleChange} 
                    required={!isClient} 
                    min="1" 
                  />
                </div>
                <div className="field">
                  <label>Fecha de Solicitud *</label>
                  <input 
                    type="date" 
                    name="fechaSolicitud" 
                    value={formData.fechaSolicitud} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
            )}

            {!isClient && formData.estadoSolicitud !== 'Pendiente' && (
              <div className="form-group full-width">
                <label>Fecha de Respuesta</label>
                <input 
                  type="date" 
                  name="fechaRespuesta" 
                  value={formData.fechaRespuesta || new Date().toISOString().substring(0, 10)} 
                  onChange={handleChange} 
                />
              </div>
            )}

            {userRole === "admin" ? (
              <div className="form-group">
                <div className="field">
                  <label>ID del Pedido</label>
                  <input
                    type="number"
                    name="idPedido"
                    value={formData.idPedido}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>ID del Producto</label>
                  <input
                    type="number"
                    name="idProducto"
                    value={formData.idProducto}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <input type="hidden" name="idPedido" value={formData.idPedido} />
                <input type="hidden" name="idProducto" value={formData.idProducto} />
              </>
            )}

            {isError && <p className="error-text">{isError}</p>}
            {message && <p className="success-text">{message}</p>}

            {isClient && devolucionToEdit && devolucionToEdit.estadoSolicitud !== 'Pendiente' && (
              <p style={{ 
                color: '#666', 
                fontSize: '0.85rem', 
                textAlign: 'center', 
                marginBottom: '10px' 
              }}>
                ℹ️ Esta solicitud está en estado <strong>{devolucionToEdit.estadoSolicitud}</strong> y no puede ser modificada.
              </p>
            )}

            <div className="modal-footer full-width">
              <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
              <button 
                type="submit" 
                className="btn-guardar" 
                disabled={isClient && devolucionToEdit && devolucionToEdit.estadoSolicitud !== 'Pendiente'}
              >
                {devolucionToEdit ? "Guardar Cambios" : "Crear Devolución"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DevolucionFormModal;