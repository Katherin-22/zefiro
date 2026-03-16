import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { ESTADOS, TIPOS_SOLICITUD } from "../constants/devolucionesConstants";

const DevolucionFormModal = ({ isOpen, onClose, onSave, devolucionToEdit, userRole = "cliente" }) => {
  const isClient = userRole === "cliente";

  const [formData, setFormData] = useState({
    id: null,
    motivo: "",
    tipoSolicitud: TIPOS_SOLICITUD[0],
    estadoSolicitud: ESTADOS[0],
    fechaSolicitud: new Date().toISOString().substring(0, 10),
    fechaRespuesta: null,
    idUsuario: "",
  });

  const [isError, setIsError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
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
    } else {
      setFormData({
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
    }
    setIsError("");
    setMessage("");
  }, [devolucionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError("");
    setMessage("");

    if (!isClient && (!formData.idUsuario || isNaN(Number(formData.idUsuario)))) {
      setIsError("❌ El ID de Usuario es obligatorio y debe ser un número.");
      return;
    }
    if (!formData.motivo.trim()) {
      setIsError("❌ El motivo de la solicitud es obligatorio.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      if (!token) {
        setIsError("No se encontró el token de autenticación.");
        return;
      }

      const now = new Date().toISOString().substring(0, 10);
      const payload = {
        motivo: formData.motivo,
        tipoSolicitud: formData.tipoSolicitud,
        estadoSolicitud: isClient ? 'Pendiente' : formData.estadoSolicitud,
        fechaSolicitud: formData.fechaSolicitud || now,
        fechaRespuesta: isClient || formData.estadoSolicitud === 'Pendiente' ? null : (formData.fechaRespuesta || now),
        idUsuario: isClient ? null : Number(formData.idUsuario),
        idProducto: Number(formData.idProducto),
        idPedido: Number(formData.idPedido),
      };

      if (!formData.idPedido || !formData.idProducto) {
        setIsError("❌ Error: No se ha seleccionado un pedido o producto válido.");
        return;
      }

      if (devolucionToEdit) {
        const devolucionId = devolucionToEdit.id_devolucion;
        await axios.put(
          `http://localhost:8080/api/devoluciones/${devolucionId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        setMessage("✅ Devolución actualizada correctamente.");
      } else {
        await axios.post(
          "http://localhost:8080/api/devoluciones",
          { ...payload, estadoSolicitud: ESTADOS[0], fechaRespuesta: null },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        setMessage("✅ ¡Devolución creada exitosamente!");
      }

      onSave();
      setTimeout(() => onClose(), 1200);

    } catch (err) {
      console.error(err.response || err);
      setIsError(err.response?.data?.message || "❌ Error al conectar con el servidor.");
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
              <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" required placeholder="Ej: Cambio de talla, producto dañado, etc." />
            </div>

            <div className="form-group">
              <div className="field">
                <label>Tipo de Solicitud *</label>
                <select name="tipoSolicitud" value={formData.tipoSolicitud} onChange={handleChange} required>
                  {TIPOS_SOLICITUD.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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

            {!isClient && (
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
            )}

            {!isClient && formData.estadoSolicitud !== 'Pendiente' && (
              <div className="form-group full-width">
                <label>Fecha de Respuesta</label>
                <input type="date" name="fechaRespuesta" value={formData.fechaRespuesta || new Date().toISOString().substring(0, 10)} onChange={handleChange} />
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
              <p style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', marginBottom: '10px' }}>
                ℹ️ Esta solicitud está en estado <strong>{devolucionToEdit.estadoSolicitud}</strong> y no puede ser modificada.
              </p>
            )}

            <div className="modal-footer full-width">
              <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
              <button type="submit" className="btn-guardar" disabled={isClient && devolucionToEdit && devolucionToEdit.estadoSolicitud !== 'Pendiente'}>
                {devolucionToEdit ? "Guardar Cambios" : "Crear Devolución"}
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
};

export default DevolucionFormModal;