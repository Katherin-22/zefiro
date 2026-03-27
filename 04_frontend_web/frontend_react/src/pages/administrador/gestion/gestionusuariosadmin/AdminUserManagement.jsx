import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon, UserPlusIcon, Search } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import styles from "../../../../styles/gestionusuarios/adminUsuarios.module.css";

// 🔑 Importamos los subcomponentes y las constantes
import MenuAdmin from "../../../../layouts/administrador/menuAdmin";
import UserFormModal from "../../../../components/gestionusuarios/modals/UserFormModal";
import DeleteConfirmModal from "../../../../components/gestionusuarios/modals/DeleteConfirmModal";
import '../../../../styles/administrador/inventario.css';

const AdminUserManagement = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // 🆕 FUNCIÓN PARA CARGAR USUARIOS DESDE LA API
  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");

      if (!token) {
        setFetchError("No se encontró el token de autenticación. Inicia sesión para ver los usuarios.");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        "http://35.171.131.177:8080/api/usuarios",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const usersFromApi = response.data.map(user => ({
        id: user.idUsuario,
        nombreUsuario: user.nombreUsuario,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        numeroDocumento: user.numeroDocumento,
        telefono: user.telefono,
        correoElectronico: user.correoElectronico,
        direccion: user.Direccion,
        idRol: user.rol.idRol,
        idTipoDeDocumento: user.tipo_de_documento.idTipoDeDocumento,
        idEstadoUsuario: user.estado_usuario.idestado_usuario,
        rol: user.rol.nombreRol,
        tipoDocumento: user.tipo_de_documento.nombreTipoDeDocumento,
        estadoUsuario: user.estado_usuario.nombre_Estado_usuario,
        activo: user.estado_usuario.idestado_usuario === 1,
      }));

      setUsers(usersFromApi);

    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err.response || err);
      setFetchError(err.response?.data?.message || "No se pudo conectar con el servidor para cargar usuarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🕒 Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 🔎 Función para filtrar usuarios
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    const lower = debouncedSearchTerm.toLowerCase().trim();
    
    return users.filter((u) => {
      const nombreCompleto = `${u.nombreUsuario || ''} ${u.primerApellido || ''} ${u.segundoApellido || ''}`.toLowerCase();
      const nombreUsuario = (u.nombreUsuario || '').toLowerCase();
      const primerApellido = (u.primerApellido || '').toLowerCase();
      const segundoApellido = (u.segundoApellido || '').toLowerCase();
      const email = (u.correoElectronico || '').toLowerCase();
      const rol = (u.rol || '').toLowerCase();
      const documento = String(u.numeroDocumento || '').toLowerCase();
      const telefono = String(u.telefono || '').toLowerCase();
      
      return (
        nombreCompleto.includes(lower) ||
        nombreUsuario.includes(lower) ||
        primerApellido.includes(lower) ||
        segundoApellido.includes(lower) ||
        email.includes(lower) ||
        rol.includes(lower) ||
        documento.includes(lower) ||
        telefono.includes(lower)
      );
    });
  }, [users, debouncedSearchTerm]);

  const handleSaveUser = (newUser) => {
    if (userToEdit) {
      setUsers(users.map((u) => (u.id === newUser.id ? newUser : u)));
    } else {
      setUsers([...users, newUser]);
    }
  };

  // 🗑️ FUNCIÓN DE ELIMINACIÓN CON PROTECCIÓN
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id;
    const userName = userToDelete.nombreUsuario;

    // 🛡️ VALIDACIÓN - No puedes eliminarte a ti mismo
    if (currentAdmin && userId === currentAdmin.idUsuario) {
      alert("❌ Acción denegada: No puedes eliminar tu propia cuenta de administrador.");
      setUserToDelete(null);
      return;
    }

    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");

      if (!token) {
        alert("No se encontró el token de autenticación. Inicia sesión nuevamente.");
        return;
      }

      await axios.delete(`http://35.171.131.177:8080/api/usuarios/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((u) => u.id !== userId));
      console.log(`Usuario ${userName} (ID ${userId}) eliminado correctamente.`);

    } catch (err) {
      console.error("❌ Error al eliminar usuario:", err.response || err);
      alert(`Error al eliminar a ${userName}: ${err.response?.data?.message || 'No se pudo conectar con el servidor.'}`);

    } finally {
      setUserToDelete(null);
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  return (
    <div className={styles.adminTheme}>
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id='container-admin'>
        <div className={styles.adminContainer}>
          <div className={styles.adminHeader}>
            <h2>Panel de Gestión de Usuarios</h2>
            {debouncedSearchTerm && (
              <div className={styles.searchInfo}>
                Mostrando resultados para: <strong>"{debouncedSearchTerm}"</strong>
                <button onClick={handleClearSearch} className={styles.clearSearch}>
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className={styles.adminActions}>
            <button
              className={styles.btnCrear}
              onClick={() => {
                setUserToEdit(null);
                setIsModalOpen(true);
              }}
            >
              <UserPlusIcon size={18} /> Crear Usuario
            </button>

            <div className={styles.searchBox}>
              <Search className={styles.iconSearch} size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, email, rol, documento o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className={styles.noUsers}>
                      Cargando usuarios... 🔄
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan="6" className={`${styles.noUsers} ${styles.errorText}`}>
                      {fetchError} ⚠️
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <strong>{user.nombreUsuario} {user.primerApellido}</strong>
                        {user.segundoApellido && ` ${user.segundoApellido}`}
                      </td>
                      <td>{user.correoElectronico}</td>
                      <td>{user.rol}</td>
                      <td>
                        <span
                          className={
                            user.activo ? styles.estadoActivo : styles.estadoInactivo
                          }
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnEditar}
                          onClick={() => {
                            console.log("Usuario a editar:", user);
                            setUserToEdit(user);
                            setIsModalOpen(true);
                          }}
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => setUserToDelete(user)}
                          style={user.id === currentAdmin?.idUsuario ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                          title={user.id === currentAdmin?.idUsuario ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                          disabled={user.id === currentAdmin?.idUsuario}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles.noUsers}>
                      {debouncedSearchTerm 
                        ? `No se encontraron resultados para "${debouncedSearchTerm}"` 
                        : "No hay usuarios registrados."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <UserFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setUserToEdit(null);
            }}
            onSave={handleSaveUser}
            userToEdit={userToEdit}
          />

          <DeleteConfirmModal
            isOpen={!!userToDelete}
            onClose={() => setUserToDelete(null)}
            userName={userToDelete?.nombreUsuario || ""}
            onConfirm={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;