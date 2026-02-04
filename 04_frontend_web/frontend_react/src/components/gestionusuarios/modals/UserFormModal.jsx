import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { ROLES } from "../constants/roles";
import "../../../styles/gestionusuarios/adminUsuarios.css";

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
      // Mapea los datos del usuario a editar al formulario
      setFormData({
        ...userToEdit,
        // Usar idRol directamente del userToEdit (mapeado en fetchUsers)
        idRol: userToEdit.idRol || 1,
        // Usar idEstadoUsuario para inicializar el checkbox
        idEstadoUsuario: userToEdit.idEstadoUsuario || (userToEdit.activo ? 1 : 2),
        activo: userToEdit.idEstadoUsuario === 1, // Aseguramos que el checkbox refleje el estado
        // Las contraseñas se dejan vacías en edición
        password: "",
        confirmPassword: "",
      });
    } else {
      // Estado inicial para un nuevo usuario
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
      // Actualizar idEstadoUsuario si cambia 'activo'
      ...(name === 'activo' && { idEstadoUsuario: checked ? 1 : 2 }),
    });
  };

  // Lógica de envío y llamadas a la API (handleSubmit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsError("");
    setMessage("");

    // Validación básica de campos
    if (formData.password !== formData.confirmPassword) {
      setIsError("Las contraseñas no coinciden.");
      return;
    }

    // Si estamos editando y no se cambia la contraseña, no enviamos la propiedad.
    const passwordPayload = (userToEdit && formData.password === "") ? {} : { password: formData.password };

    const payload = {
      numeroDocumento: parseInt(formData.numeroDocumento, 10),
      nombreUsuario: formData.nombreUsuario,
      primerApellido: formData.primerApellido,
      segundoApellido: formData.segundoApellido,
      telefono: formData.telefono,
      correoElectronico: formData.correoElectronico,
      direccion: "Calle 123 #45-67, Bogotá, Colombia", // Valor estático por ahora
      idRol: Number(formData.idRol),
      idTipoDeDocumento: 1, // Valor estático por ahora
      idEstadoUsuario: formData.activo ? 1 : 2,
      ...passwordPayload, // Incluir contraseña solo si se cambia o es nuevo
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
        // 🔹 Actualizar usuario existente
        const userId = userToEdit.id;

        if (!userId || isNaN(Number(userId))) {
          setIsError("❌ Error: No se encontró el ID del usuario a editar o es inválido. Intenta recargar la página.");
          console.error("ID de usuario no válido para edición:", userId, userToEdit);
          return;
        }

        url = `http://localhost:8080/api/usuarios/${userId}`;
        method = 'put';
      } else {
        // 🔹 Crear nuevo usuario (usando el endpoint de registro)
        url = "http://localhost:8080/api/auth/register";
        method = 'post';
        // Asegurarse que haya contraseña para el registro
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
        // Asumimos que el endpoint de registro devuelve el ID del nuevo usuario
        // Si tu registro devuelve el usuario completo, necesitarías mapear user.idUsuario
        if (response.data.success === true && response.data.data.id) {
          setMessage("✅ ¡Usuario creado exitosamente!");
          backendId = Number(response.data.data.id);
        } else {
          setIsError(response.data.message || "Error al registrar usuario.");
          return;
        }
      }

      // Llama a la función del padre para actualizar la tabla
      onSave({
        id: backendId,
        nombreUsuario: formData.nombreUsuario,
        primerApellido: formData.primerApellido,
        segundoApellido: formData.segundoApellido,
        numeroDocumento: formData.numeroDocumento,
        telefono: formData.telefono,
        correoElectronico: formData.correoElectronico,
        // Enviamos los IDs del backend que necesitamos para futuras ediciones
        idRol: Number(formData.idRol),
        idEstadoUsuario: payload.idEstadoUsuario,
        // Propiedades de visualización
        rol: ROLES.find((r) => r.id === Number(formData.idRol))?.nombre || "cliente",
        activo: formData.activo,
      });

      // Cerramos el modal después de un breve tiempo para mostrar el mensaje de éxito
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
          // Error específico por número de documento duplicado
          setIsError("⚠️ Error: El número de documento ya está registrado.");
        }
        else {
          setIsError(msg);
        }
      } else {
        setIsError("❌ No se pudo conectar con el servidor. Verifica tu conexión o el backend.");
      }
    }
  };

  // ... Resto del render del modal ...
  return (
  <div className="admin-theme">
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{userToEdit ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="row">
            {/* Fila 1: Nombre y Primer Apellido */}
            <div className="col-12 col-lg-6 mb-3">
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field">
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
              <div className="field checkbox-group w-100">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="activo"
                    id="activoCheckbox"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="activoCheckbox">
                    Usuario Activo
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          <div className="row">
            <div className="col-12">
              {isError && <p className="error-text">⚠️ {isError}</p>}
              {message && <p className="success-text">{message}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="modal-footer mt-4">
            <div className="row w-100">
              <div className="col-12 d-flex justify-content-end gap-2">
                <button type="button" onClick={onClose} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {userToEdit ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default UserFormModal;