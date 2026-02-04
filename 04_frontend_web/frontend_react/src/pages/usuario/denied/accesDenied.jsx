// 📁 pages/errors/AccessDenied.jsx
import { Link, Navigate } from "react-router-dom";
import styles from "../../../styles/home/errors.module.css"

const AccessDenied = () => {
  return (
    <div className={styles.accessDeniedContainer}>
      <div className={styles.accessDeniedContent}>
        <h1 className={styles.errorCode}>403</h1>
        <h2 className={styles.errorTitle}>Acceso Denegado</h2>
        <p className={styles.errorMessage}>
          Ups.. no tienes iniciada una sesión.
        </p>
        <div className={styles.actions}>
          <Link to={'/'} className={styles.btnPrimary}>
            Volver al Inicio
          </Link>
          <Link to={'/loginPage'} className={styles.btnSecondary}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;