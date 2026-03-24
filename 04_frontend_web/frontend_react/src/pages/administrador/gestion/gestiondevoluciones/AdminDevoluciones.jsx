import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon, UserPlusIcon, Search } from "lucide-react";
// Importa el CSS Module
import styles from "../../../../styles/gestionardevoluciones/adminDevoluciones.module.css";
import DevolucionFormModal from "../../../../components/gestiondevoluciones/modals/DevolucionFormModal";
import DeleteConfirmModal from "../../../../components/gestiondevoluciones/modals/DeleteConfirmModal";
// Importar el nuevo modal para editar estado
import EditarEstadoModal from "../../../../components/gestiondevoluciones/modals/EditarEstadoModal";
import '../../../../styles/administrador/inventario.css';
import MenuAdmin from "../../../../layouts/administrador/menuAdmin";
import api_url from "../../../../services/administrador/api";

const AdminDevoluciones = () => {
  const [devoluciones, setDevoluciones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devolucionToEdit, setDevolucionToEdit] = useState(null);
  const [devolucionToDelete, setDevolucionToDelete] = useState(null);
  // Nuevo estado para el modal de editar estado
  const [devolucionToEditEstado, setDevolucionToEditEstado] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchDevoluciones = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      if (!token) { 
        setFetchError("Token no encontrado."); 
        setLoading(false); 
        return; 
      }

      const response = await api_url.get("/api/devoluciones", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevoluciones(response.data);

    } catch (err) {
      console.error(err.response || err);
      setFetchError(`❌ Error al cargar datos: ${err.response?.statusText || 'No se pudo conectar con el servidor.'}`);
      setDevoluciones([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchDevoluciones(); 
  }, []);
  
  // 🕒 Debounce para la búsqueda - mejora el rendimiento
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSaveDevolucion = () => fetchDevoluciones();

  const handleDeleteDevolucion = async () => {
    if (!devolucionToDelete) return;
    const devolucionId = devolucionToDelete.id_devolucion;
    try {
      const token = localStorage.getItem("authToken")?.replace(/"/g, "");
      if (!token) { 
        alert("Token no encontrado."); 
        return; 
      }

      await api_url.delete(`/api/devoluciones/${devolucionId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchDevoluciones();
      console.log(`Devolución ${devolucionId} eliminada correctamente.`);

    } catch (err) {
      console.error(err.response || err);
      alert(`Error al eliminar: ${err.response?.data?.message || 'No se pudo conectar con el servidor.'}`);
    } finally { 
      setDevolucionToDelete(null); 
    }
  };

  // 🔎 Función para filtrar devoluciones (CORREGIDA Y MEJORADA)
  const filteredDevoluciones = useMemo(() => {
    if (!debouncedSearchTerm) return devoluciones;
    const lower = debouncedSearchTerm.toLowerCase().trim();
    
    return devoluciones.filter(d => {
      // Convertir todo a string de forma segura
      const motivo = String(d.motivo || '').toLowerCase();
      const tipoSolicitud = String(d.tipoSolicitud || '').toLowerCase();
      const estadoSolicitud = String(d.estadoSolicitud || '').toLowerCase();
      const idDevolucion = String(d.id_devolucion || '').toLowerCase();
      const usuarioId = String(d.usuario?.idUsuario || '').toLowerCase();
      const fechaSolicitud = String(d.fechaSolicitud || '').toLowerCase();
      
      // Buscar en múltiples campos
      return (
        motivo.includes(lower) ||
        tipoSolicitud.includes(lower) ||
        estadoSolicitud.includes(lower) ||
        idDevolucion.includes(lower) ||
        usuarioId.includes(lower) ||
        fechaSolicitud.includes(lower)
      );
    });
  }, [devoluciones, debouncedSearchTerm]);

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  if (loading && devoluciones.length === 0) return (
    <div className={styles.adminContainer}>
      <p className={styles.loadingText}>Cargando devoluciones...</p>
    </div>
  );
  
  if (fetchError) return (
    <div className={styles.adminContainer}>
      <p className={styles.errorText}>{fetchError}</p>
      <button className={styles.btnRecargar} onClick={fetchDevoluciones}>Recargar</button>
    </div>
  );

  return (
    <div className={styles.admin2Theme}>
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id='container-admin'>
        <div className={styles.adminContainer}>
          <div className={styles.adminHeader}>
            <h2>Panel de Gestión de Devoluciones</h2>
            <p>Vista de Administrador: Control total sobre los registros de devoluciones y cambios.</p>
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
                setDevolucionToEdit(null); 
                setIsModalOpen(true); 
              }}
            >
              <UserPlusIcon size={18} /> Crear Nueva Devolución
            </button>
            <div className={styles.searchBox}>
              <Search className={styles.iconSearch} size={18} />
              <input 
                type="text" 
                placeholder="Buscar por ID, motivo, tipo, estado, usuario o fecha..." 
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
                  <th>Usuario ID</th>
                  <th>Motivo</th>
                  <th>Tipo Solicitud</th>
                  <th>Estado</th>
                  <th>Fecha Solicitud</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevoluciones.length > 0 ? filteredDevoluciones.map(d => (
                  <tr key={d.id_devolucion}>
                    <td>{d.id_devolucion}</td>
                    <td>{d.usuario?.idUsuario || 'N/A'}</td>
                    <td title={d.motivo}>{d.motivo.substring(0, 50) + (d.motivo.length > 50 ? '...' : '')}</td>
                    <td>
                      <span className={d.tipoSolicitud?.toLowerCase() === 'cambio' ? styles.tipoCambio : styles.tipoDevolucion}>
                        {d.tipoSolicitud}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.estado} ${
                        d.estadoSolicitud?.toLowerCase() === 'pendiente' ? styles.estadoPendiente :
                        d.estadoSolicitud?.toLowerCase() === 'en proceso' ? styles.estadoProceso :
                        d.estadoSolicitud?.toLowerCase() === 'aprobada' ? styles.estadoAprobada :
                        d.estadoSolicitud?.toLowerCase() === 'rechazada' ? styles.estadoRechazada :
                        d.estadoSolicitud?.toLowerCase() === 'completada' ? styles.estadoCompletada : ''
                      }`}>
                        {d.estadoSolicitud}
                      </span>
                    </td>
                    <td>{new Date(d.fechaSolicitud).toLocaleDateString()}</td>
                    <td>
                      {/* NUEVO BOTÓN PARA CAMBIAR ESTADO */}
                      <button 
                        className={styles.btnEstado} 
                        onClick={() => setDevolucionToEditEstado(d)}
                        title="Cambiar estado"
                      >
                        <span role="img" aria-label="cambiar estado">✏️</span>
                      </button>
                      
                      <button 
                        className={styles.btnEliminar} 
                        onClick={() => setDevolucionToDelete(d)}
                        title="Eliminar devolución"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className={styles.noUsers}>
                      {debouncedSearchTerm 
                        ? `No se encontraron resultados para "${debouncedSearchTerm}"` 
                        : "No hay devoluciones registradas."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal para crear/editar devolución */}
          <DevolucionFormModal 
            isOpen={isModalOpen} 
            onClose={() => { 
              setIsModalOpen(false); 
              setDevolucionToEdit(null); 
            }} 
            onSave={handleSaveDevolucion} 
            devolucionToEdit={devolucionToEdit} 
            userRole="admin"
          />
          
          {/* Modal para confirmar eliminación */}
          <DeleteConfirmModal 
            isOpen={!!devolucionToDelete} 
            onClose={() => setDevolucionToDelete(null)} 
            devolucionName={devolucionToDelete?.id_devolucion || ""} 
            onConfirm={handleDeleteDevolucion} 
          />

          {/* NUEVO MODAL PARA EDITAR ESTADO */}
          <EditarEstadoModal 
            isOpen={!!devolucionToEditEstado}
            onClose={() => setDevolucionToEditEstado(null)}
            onSave={() => {
              fetchDevoluciones();
              setDevolucionToEditEstado(null);
            }}
            devolucion={devolucionToEditEstado}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDevoluciones;