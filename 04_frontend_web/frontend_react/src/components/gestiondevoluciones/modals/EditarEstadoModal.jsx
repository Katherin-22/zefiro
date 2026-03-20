import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import "../../../styles/gestionardevoluciones/editarEstadoModal.css";

const EditarEstadoModal = ({ isOpen, onClose, onSave, devolucion }) => {
  const [selectedEstado, setSelectedEstado] = useState(devolucion?.estadoSolicitud || "Pendiente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const estados = ["Pendiente", "En proceso", "Aprobada", "Rechazada", "Completada"];

  // Función para formatear fecha correctamente
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    
    // Si ya viene en formato ISO, extraer solo la fecha
    if (fechaStr.includes('T')) {
      return fechaStr.split('T')[0] + " 00:00:00";
    }
    // Si viene como YYYY-MM-DD, agregar la hora
    if (fechaStr.length === 10) {
      return fechaStr + " 00:00:00";
    }
    // Si ya tiene el formato correcto, devolverlo
    return fechaStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      if (!token) {
        setError("No se encontró el token de autenticación.");
        setLoading(false);
        return;
      }

      // Preparar el payload con el nuevo estado y fechas formateadas
      const payload = {
        motivo: devolucion.motivo,
        tipoSolicitud: devolucion.tipoSolicitud,
        estadoSolicitud: selectedEstado,
        fechaSolicitud: formatearFecha(devolucion.fechaSolicitud),
        fechaRespuesta: selectedEstado !== "Pendiente" ? 
          new Date().toISOString().split('T')[0] + " 00:00:00" : null,
        idProducto: devolucion.producto?.idProducto,
        idPedido: devolucion.pedido?.idPedido,
        idUsuario: devolucion.usuario?.idUsuario
      };

      console.log("📤 Enviando payload:", payload); // Para debugging

      const response = await axios.put(
        `http://35.171.131.177:8080/api/devoluciones/${devolucion.id_devolucion}`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          } 
        }
      );

      setSuccess("✅ Estado actualizado correctamente");
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);

    } catch (err) {
      console.error("❌ Error al actualizar:", err.response || err);
      setError(err.response?.data?.error || err.response?.data?.message || "Error al actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="editar-estado-overlay">
      <div className="editar-estado-container">
        <div className="editar-estado-header">
          <h3>Cambiar Estado de Devolución</h3>
          <button onClick={onClose} className="editar-estado-close">
            <X size={20} />
          </button>
        </div>

        <div className="editar-estado-body">
          <div className="editar-estado-info">
            <p><strong>ID Devolución:</strong> #{devolucion.id_devolucion}</p>
            <p><strong>Motivo:</strong> {devolucion.motivo}</p>
            <p><strong>Tipo:</strong> {devolucion.tipoSolicitud}</p>
            <p><strong>Usuario ID:</strong> {devolucion.usuario?.idUsuario}</p>
            <p><strong>Estado actual:</strong> 
              <span className={`estado-badge estado-${devolucion.estadoSolicitud?.toLowerCase().replace(' ', '-')}`}>
                {devolucion.estadoSolicitud}
              </span>
            </p>
            <p><strong>Fecha solicitud:</strong> {devolucion.fechaSolicitud}</p>
          </div>

          <form onSubmit={handleSubmit} className="editar-estado-form">
            <div className="form-group">
              <label>Nuevo Estado:</label>
              <select 
                value={selectedEstado} 
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="estado-select"
                disabled={loading}
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="editar-estado-footer">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn-cancelar"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-guardar"
                disabled={loading || selectedEstado === devolucion.estadoSolicitud}
              >
                {loading ? "Actualizando..." : "Actualizar Estado"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarEstadoModal;