import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { ROLES } from "../constants/roles";
import styles from "../../../styles/gestionusuarios/adminUsuarios.module.css";

const UserFormModal = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [formData, setFormData] = useState({
    nombreUsuario: "",
    primerApellido: "",
    segundoApellido: "",
    numeroDocumento: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    correoElectronico: "",
    idRol: 1,
    idTipoDeDocumento: 1,
    idEstadoUsuario: 1,
    activo: true,
  });

  const [isError, setIsError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        idRol: userToEdit.idRol || 1,
        idEstadoUsuario: userToEdit.idEstadoUsuario || (userToEdit.activo ? 1 : 2),
        activo: userToEdit.idEstadoUsuario === 1,
        password: "",
        confirmPassword: "",
      });
    } else {
      setFormData({
        nombreUsuario: "",
        primerApellido: "",
        segundoApellido: "",
        numeroDocumento: "",
        telefono: "",
        password: "",
        confirmPassword: "",
        correoElectronico: "",
        idRol: 1,
        idTipoDeDocumento: 1,
        idEstadoUsuario: 1,
        activo: true,
      });
    }
    setIsError("");
    setMessage("");
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
      ...(name === 'activo' && { idEstadoUsuario: checked ? 1 : 2 }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setIsError("Las contraseñas no coinciden.");
      return;
    }

    const passwordPayload = (userToEdit && formData.password === "") ? {} : { password: formData.password };

    const payload = {
      numeroDocumento: parseInt(formData.numeroDocumento, 10),
      nombreUsuario: formData.nombreUsuario,
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido,
      telefono: formData.telefono,
      correoElectronico: formData.correoElectronico,
      direccion: "Calle 123 #45-67, Bogotá, Colombia",
      idRol: Number(formData.idRol),
      idTipoDeDocumento: 1,
      idEstadoUsuario: formData.activo ? 1 : 2,
      ...passwordPayload,
    };

    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      console.log("Token actual:", token);

      if (!token) {
        setIsError("No se encontró el token de autenticación. Inicia sesión nuevamente.");
        return;
      }

      let response;
      let url;
      let method;

      if (userToEdit) {
        const userId = userToEdit.id;

        if (!userId || isNaN(Number(userId))) {
          setIsError("❌ Error: No se encontró el ID del usuario a editar o es inválido. Intenta recargar la página.");
          console.error("ID de usuario no válido para edición:", userId, userToEdit);
          return;
        }

        url = `http://35.171.131.177:8080/api/usuarios/${userId}`;
        method = 'put';
      } else {
        url = "http://35.171.131.177:8080/api/auth/register";
        method = 'post';
        if (!payload.password) {
          setIsError("La contraseña es obligatoria para un nuevo usuario.");
          return;
        }
      }

      response = await axios({
        method: method,
        url: url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let backendId;
      if (userToEdit) {
        setMessage("✅ Usuario actualizado correctamente.");
        backendId = userToEdit.id;
      } else {
        if (response.data.success === true && response.data.data.id) {
          setMessage("✅ ¡Usuario creado exitosamente!");
          backendId = Number(response.data.data.id);
        } else {
          setIsError(response.data.message || "Error al registrar usuario.");
          return;
        }
      }

      onSave({
        id: backendId,
        nombreUsuario: formData.nombreUsuario,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        numeroDocumento: formData.numeroDocumento,
        telefono: formData.telefono,
        correoElectronico: formData.correoElectronico,
        idRol: Number(formData.idRol),
        idEstadoUsuario: payload.idEstadoUsuario,
        rol: ROLES.find((r) => r.id === Number(formData.idRol))?.nombre || "cliente",
        activo: formData.activo,
      });

      setTimeout(() => onClose(), 1200);

    } catch (err) {
      console.error("Error detallado:", err.response || err);
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message || err.response.data?.error || `Error del servidor (Estado: ${status}).`;

        if (status === 403) {
          setIsError("🚫 Acceso Denegado (403): Revisa los permisos del token.");
        } else if (status === 404) {
          setIsError("❌ Usuario no encontrado (404).");
        } else if (status === 400 && msg.includes("documento")) {
          setIsError("⚠️ Error: El número de documento ya está registrado.");
        } else {
          setIsError(msg);
        }
      } else {
        setIsError("❌ No se pudo conectar con el servidor. Verifica tu conexión o el backend.");
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3>{userToEdit ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className="row">
            {/* Fila 1: Nombre y Primer Apellido */}
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Nombres *</label>
                <input
                  type="text"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Primer Apellido *</label>
                <input
                  type="text"
                  name="primerApellido"
                  value={formData.primerApellido}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            {/* Fila 2: Segundo Apellido y Cédula */}
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Segundo Apellido *</label>
                <input
                  type="text"
                  name="segundoApellido"
                  value={formData.segundoApellido}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Cédula *</label>
                <input
                  type="text"
                  name="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            {/* Fila 3: Teléfono y Correo */}
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Teléfono *</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            {/* Fila 4: Contraseña y Confirmación */}
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Contraseña {userToEdit ? "" : "*"}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!userToEdit}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Confirmar Contraseña {userToEdit ? "" : "*"}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!userToEdit}
                  className="form-control"
                />
              </div>
            </div>

            {/* Fila 5: Rol y Estado */}
            <div className="col-12 col-lg-6 mb-3">
              <div className={styles.formGroup}>
                <label>Rol</label>
                <select 
                  name="idRol" 
                  value={formData.idRol} 
                  onChange={handleChange}
                  className="form-control"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-12 col-lg-6 mb-3 d-flex align-items-end">
              <div className={styles.checkboxGroup}>
                <div className={styles.formCheck}>
                  <input
                    className={styles.formCheckInput}
                    type="checkbox"
                    name="activo"
                    id="activoCheckbox"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  <label className={styles.formCheckLabel} htmlFor="activoCheckbox">
                    Usuario Activo
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          <div className="row">
            <div className="col-12">
              {isError && <p className={styles.errorText}>⚠️ {isError}</p>}
              {message && <p className={styles.successText}>{message}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnCancelar}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar}>
              {userToEdit ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;