import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { ESTADOS, TIPOS_SOLICITUD } from "../constants/devolucionesConstants";

const DevolucionFormModal = ({ isOpen, onClose, onSave, devolucionToEdit, userRole = "cliente", pedido, producto, userId: propUserId, pedidosCompletados }) => {
  const isClient = userRole === "cliente";
  const { user } = useAuth();
  const finalUserId = propUserId || user?.idUsuario || user?.id;
  const isEditable = !isClient || !devolucionToEdit || (isClient && devolucionToEdit.estadoSolicitud === "Pendiente");

  const estadoInicialForm = useCallback (() => ({
    id: null,
    motivo: "",
    tipoSolicitud: TIPOS_SOLICITUD[0],
    estadoSolicitud: ESTADOS[0],
    fechaSolicitud: new Date().toISOString().substring(0, 10),
    fechaRespuesta: null,
    idUsuario: finalUserId || "",
    idProducto: "",
    idPedido: "",
  }), [finalUserId]);

  const [formData, setFormData] = useState(estadoInicialForm);
  const [productosDelPedido, setProductosDelPedido] = useState([]);
  const [isError, setIsError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FUNCIÓN PARA FILTRAR PRODUCTOS DEL PEDIDO SELECCIONADO ---

  const actualizarProductosDisponibles = useCallback((idPedidoRecibido, listaPedidos) => {
    if (!idPedidoRecibido || !listaPedidos || listaPedidos.length === 0) {
      setProductosDelPedido([]);
      return;
    }

    const pedidoEncontrado = listaPedidos.find(p => String(p.idPedido) === String(idPedidoRecibido));

    if (pedidoEncontrado && pedidoEncontrado.carrito && pedidoEncontrado.carrito.detalles) {

      const productosSimplificados = pedidoEncontrado.carrito.detalles.map(detalle => ({
        idProducto: detalle.stock.producto.idProducto, // El ID que pide tu backend
        nombreProducto: detalle.stock.producto.nombreProducto, // El nombre para el usuario
        nombreVariacion: detalle.stock.variacion.nombre // La talla
      }));

      setProductosDelPedido(productosSimplificados);
      console.log("✅ Productos procesados para el selector:", productosSimplificados);
      return productosSimplificados;
    }
  }, []);

  // 1. Cargar pedidos del usuario si entra desde el menú (sin pedido preseleccionado)
  useEffect(() => {
    if (isOpen && isClient && finalUserId) {

      const idActual = pedido || formData.idPedido;

      if (idActual && pedidosCompletados.length > 0) {
        setFormData(prev => ({ ...prev, idPedido: idActual }));
        actualizarProductosDisponibles(idActual, pedidosCompletados);
      }
    }
  }, [isOpen, pedidosCompletados, finalUserId, pedido, isClient, actualizarProductosDisponibles, formData.idPedido]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsError("");
    setMessage("");
    setIsSubmitting(false);

    if (devolucionToEdit) {
      setFormData({
        id: devolucionToEdit.id_devolucion,
        motivo: devolucionToEdit.motivo || "",
        tipoSolicitud: devolucionToEdit.tipoSolicitud || TIPOS_SOLICITUD[0],
        estadoSolicitud: devolucionToEdit.estadoSolicitud || ESTADOS[0],
        fechaSolicitud: devolucionToEdit.fechaSolicitud || new Date().toISOString().substring(0, 10),
        fechaRespuesta: devolucionToEdit.fechaRespuesta || null,
        idUsuario: devolucionToEdit.usuario?.idUsuario || "",
        idProducto: devolucionToEdit.producto?.idProducto || "",
        idPedido: devolucionToEdit.pedido?.idPedido || "",
      });
      actualizarProductosDisponibles(devolucionToEdit.pedido?.idPedido, pedidosCompletados);
    } else {
      
      const idPedidoInicial = pedido || "";
      const idProductoInicial = producto || "";

      setFormData({
        ...estadoInicialForm(),
        id: null,
        motivo: "",
        tipoSolicitud: TIPOS_SOLICITUD[0],
        estadoSolicitud: "Pendiente",
        fechaSolicitud: new Date().toISOString().substring(0, 10),
        fechaRespuesta: null,
        idUsuario: finalUserId || "",
        idPedido: idPedidoInicial,
        idProducto: idProductoInicial,
      });

      if (idPedidoInicial && pedidosCompletados.length > 0) {
        actualizarProductosDisponibles(idPedidoInicial, pedidosCompletados);
      }
    }
  }, [isOpen, devolucionToEdit, pedido, producto, finalUserId, pedidosCompletados, estadoInicialForm, actualizarProductosDisponibles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "idPedido" && isClient) {
        newData.idProducto = "";
        actualizarProductosDisponibles(value, pedidosCompletados);
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isClient && !isEditable) return; 
    console.log("BOTÓN PRESIONADO - Datos actuales en el estado:", formData);
    const idPedFinal = Number(formData.idPedido);
    const idProdFinal = Number(formData.idProducto);
    const idUserFinal = Number(isClient ? finalUserId : formData.idUsuario);
    console.log("🚀 Verificando IDs antes de enviar:", { idPedFinal, idProdFinal, idUserFinal });

    setIsError("");
    setMessage("");

    if (!isClient && (!formData.idUsuario || isNaN(Number(formData.idUsuario)))) {
      setIsError("❌ El ID de Usuario es obligatorio y debe ser un número.");
      return;
    }

    if (!idPedFinal || !idProdFinal || !idUserFinal) {
      console.error("❌ Faltan IDs críticos:", { idPedFinal, idProdFinal, idUserFinal });
      setIsError("❌ No se pudieron determinar los datos del pedido o producto. Cierra el modal e intenta de nuevo.");
      return;
    }

    if (!formData.motivo?.trim()) {
      setIsError("❌ El motivo de la solicitud es obligatorio.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      const now = new Date().toISOString().substring(0, 10);

      if (!token) {
        setIsError("No se encontró el token de autenticación.");
        return;
      }

      const payload = {
        motivo: formData.motivo,
        tipoSolicitud: formData.tipoSolicitud,
        estadoSolicitud: isClient ? 'Pendiente' : formData.estadoSolicitud,
        fechaSolicitud: formData.fechaSolicitud || now,
        fechaRespuesta: isClient || formData.estadoSolicitud === 'Pendiente' ? null : (formData.fechaRespuesta || now),
        idUsuario: idUserFinal,
        idProducto: idProdFinal,
        idPedido: idPedFinal,
      };

      console.log("🚀 Payload listo para enviar:", payload);

      if (devolucionToEdit) {
        await axios.put(
          `http://localhost:8080/api/devoluciones/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });
        setMessage("✅ Devolución actualizada correctamente.");
      } else {
        await axios.post(
          "http://localhost:8080/api/devoluciones", payload, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });
        setMessage("✅ ¡Devolución creada exitosamente!");
      }

      setTimeout(() => {
        setFormData(estadoInicialForm());
        if (onSave) onSave();
      }, 1200);

    } catch (err) {
      console.error(err.response || err);
      setIsError(err.response?.data?.message || "❌ Error al conectar con el servidor.");
      setIsSubmitting(false);
    }
  };

  const handleCerrarLimpiamente = () => {
    setFormData(estadoInicialForm()); // Resetear form
    onClose(); // Avisar al padre
  };

  if (!isOpen) return null;

  return (
    <div className="admin2-theme">
      <div className="modal-overlay" onClick={handleCerrarLimpiamente}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{devolucionToEdit ? "Editar Devolución" : "Registrar Nueva Devolución"}</h3>
            <button type="button" onClick={handleCerrarLimpiamente} className="close-btn"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">

            {/* --- SECCIÓN DE SELECCIÓN DE PEDIDO --- */}
            <div className="form-group">
              <div className="field">
                <label>Seleccionar Pedido *</label>
                {isClient ? (
                  /* Si el usuario está eligiendo manualmente en el modal */
                  <select name="idPedido" value={formData.idPedido} onChange={handleChange} className="form-select" required disabled={!isEditable}>
                    <option value="">-- Selecciona un pedido --</option>
                    {pedidosCompletados?.map((p) => (
                      <option key={p.idPedido} value={p.idPedido}>
                        Pedido #{p.idPedido} - Fecha: {new Date(p.fechaPedido).toLocaleDateString()} - Total: ${p.totalFinal?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="number" name="idPedido" value={formData.idPedido} onChange={handleChange} required placeholder="ID Pedido" disabled={!isEditable} />
                )}
              </div>

              {/* --- SELECTOR DE PRODUCTO --- */}
              <div className="field" style={{ marginTop: '15px' }}>
                <label>Producto a devolver *</label>
                {isClient ? (
                    <select name="idProducto" value={formData.idProducto} onChange={handleChange} required disabled={!formData.idPedido || !isEditable}>
                      <option value="">-- Selecciona el producto --</option>
                      {productosDelPedido.map((prod) => (
                        <option key={prod.idProducto} value={prod.idProducto}>
                          {prod.nombreProducto} {prod.nombreVariacion ? `(Talla: ${prod.nombreVariacion})` : ""}
                        </option>
                      ))}
                    </select>
                ) : (
                  <input type="number" name="idProducto" value={formData.idProducto} onChange={handleChange} required placeholder="ID Producto" disabled={!isEditable} />
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="field">
                <label>Tipo de Solicitud *</label>
                <select name="tipoSolicitud" value={formData.tipoSolicitud} onChange={handleChange} required disabled={!isEditable}>
                  {TIPOS_SOLICITUD.map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Motivo *</label>
                <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" required placeholder="Ej: Cambio de talla, producto dañado, etc." disabled={!isEditable} />
              </div>

              {/* Solo el administrador puede ver y editar el estado */}
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
              <div className="info-preseleccion" style={{ background: '#f0f7ff', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #d0e7ff' }}>
                <p style={{ margin: '2px 0' }}><strong>Pedido:</strong> #{formData.idPedido || "No detectado"}</p>
                <p style={{ margin: '2px 0' }}><strong>Producto ID:</strong> {formData.idProducto || "No detectado"}</p>
              </div>
            )}

            {!isClient && (
              <>
                <div className="form-group">
                  <div className="field">
                    <label>ID de Usuario *</label>
                    <input type="number" name="idUsuario" value={formData.idUsuario} onChange={handleChange} required={!isClient} min="1" />
                  </div>
                  <div className="field">
                    <label>Fecha de Solicitud *</label>
                    <input type="date" name="fechaSolicitud" value={formData.fechaSolicitud} onChange={handleChange} required />
                  </div>
                </div>
                {formData.estadoSolicitud !== 'Pendiente' && (
                  <div className="form-group full-width">
                    <label>Fecha de Respuesta</label>
                    <input type="date" name="fechaRespuesta" value={formData.fechaRespuesta || new Date().toISOString().substring(0, 10)} onChange={handleChange} />
                  </div>
                )}
              </>
            )}

            {isError && <p className="error-text">{isError}</p>}
            {message && <p className="success-text">{message}</p>}

            {isClient && devolucionToEdit && devolucionToEdit.estadoSolicitud !== 'Pendiente' && (
              <p style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', marginBottom: '10px' }}>
                ℹ️ Esta solicitud está en estado <strong>{devolucionToEdit.estadoSolicitud}</strong> y no puede ser modificada.
              </p>
            )}

            <div className="modal-footer full-width">
              <button type="button" onClick={handleCerrarLimpiamente} className="btn-cancelar" disabled={isSubmitting}> Cancelar </button>
              <button type="submit" className="btn-guardar" disabled={(isClient && devolucionToEdit && devolucionToEdit.estadoSolicitud !== 'Pendiente') || isSubmitting}>
                {isSubmitting ? "Procesando..." : (devolucionToEdit ? "Guardar Cambios" : "Crear Devolución")}
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
};

export default DevolucionFormModal;