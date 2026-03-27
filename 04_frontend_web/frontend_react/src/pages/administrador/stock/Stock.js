import React, { useState, useEffect } from "react";
import {
  getStock,
  deleteStock,
} from "../../../services/administrador/StockService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";
import { Link } from "react-router-dom";

import styles from "../../../styles/administrador/stockgeneral.module.css";
import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await getStock();
        console.log("Stock desde API:", response.data);
        setStock(response.data);
      } catch (error) {
        console.error("Error al cargar stock", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  if (loading) return <p>Cargando stock...</p>;

  return (
    <div>
      <nav>
        <MenuAdmin />
      </nav>
      <div className={styles.containerAdminStockGen}>
        <div>
          <div className={`row ${styles.customHeader}`}>
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className={`mb-0 ${styles.h1}`}>STOCK GENERAL</h1>
            </div>
          </div>
          <div className="row">
            <div className={`col-9 d-flex align-items-end px-1 gap-2 w-50 ${styles.islaStockGen}`}>
              <Link
                to="/ver_categoria"
                className={`btn ${styles.customBtnGenStock}`}
              >
                Categoria
              </Link>
              <Link
                to="/ver_producto"
                className={`btn ${styles.customBtnGenStock}`}
              >
                Producto
              </Link>
              <Link
                to="/ver_promocion"
                className={`btn ${styles.customBtnGenStock}`}
              >
                Promoción
              </Link>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Material</th>
                    <th>Precio de Venta</th>
                    <th>Talla Disponible</th>
                    <th>Color Disponible</th>
                    <th>Stock Actual</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((s) => (
                    <tr key={s.idProducto || s.codigoReferencia}>
                      <td>{s.codigoReferencia}</td>
                      <td>{s.nombreProducto}</td>
                      <td>{s.nombreCategoria}</td>
                      <td>{s.nombreMaterial}</td>
                      <td>${s.precio}</td>
                      <td>{s.nombre || "No especificado"}</td>
                      <td>{s.nombreColor || "No especificado"}</td>
                      <td>{s.stockActual}</td>
                      <td>
                        <span className={`${styles.estadoBadge} ${s.estadoProducto === 'Activo' ? styles.activo : styles.inactivo}`}>
                          {s.estadoProducto}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/stock/producto/${s.idProducto}`}
                          className={`btn ${styles.btnLight}`}
                        >
                          Agregar Stock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}