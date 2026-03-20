import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "../../../styles/gestionusuarios/adminUsuarios.module.css";

const DeleteConfirmModal = ({ isOpen, onClose, userName, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContainer} ${styles.confirmDelete}`}>
        <AlertTriangle className={styles.iconWarning} />
        <h3>Confirmar Eliminación</h3>
        <p>
          ¿Deseas eliminar al usuario <strong>{userName}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className={`${styles.modalFooter} ${styles.confirmFooter}`}>
          <button onClick={onClose} className={styles.btnCancelar}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={styles.btnEliminarModal}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;