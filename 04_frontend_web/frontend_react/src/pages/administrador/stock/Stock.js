import React, { useState, useEffect } from "react";
import {
  getStock,
  deleteStock,
} from "../../../services/administrador/StockService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/stockgeneral.css";
import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import { Link, useParams } from "react-router-dom";

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer los stocks al cargar la página
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await getStock();
        console.log("Stock desde API:", response.data); // <-- aquí revisa los nombres
        setStock(response.data);
      } catch (error) {
        console.error("Error al cargar stock", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  // Función para eliminar un stock directamente desde el service
  const handleDeleteStock = async (idStock) => {
    console.log("Intentando eliminar idStock:", idStock); // <--- revisa esto
    if (!window.confirm("¿Estás seguro de eliminar este stock?")) return;

    try {
      await deleteStock(idStock);
      setStock(stock.filter((s) => s.idStock !== idStock)); // actualizamos la lista
      alert("Stock eliminado");
    } catch (error) {
      console.error("Error al eliminar stock", error);
      alert(
        "No se pudo eliminar el stock. Revisa si tiene relaciones activas.",
      );
    }
  };

  if (loading) return <p>Cargando stock...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-stockGen">
        <div className="header">
          <div className="row custom-header ">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">STOCK GENERAL</h1>
            </div>
          </div>
          <div className="row ">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-StockGen">
              <Link
                to="/ver_categoria"
                className="btn custom-btn-genStock btn-light"
              >
                Categoria
              </Link>
              <Link
                to="/ver_producto"
                className="btn custom-btn-genStock btn-light"
              >
                Producto
              </Link>
              <Link
                to="/ver_promocion"
                className="btn custom-btn-genStock btn-light"
              >
                Promoción
              </Link>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>{" "}
                  {/* ← Cambiado de "Tipo Producto" a "Categoría" */}
                  <th>Material</th> {/* ← NUEVA columna */}
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
                    <td>{s.nombreCategoria}</td> {/* Categoría */}
                    <td>{s.nombreMaterial}</td> {/* Material */}
                    <td>${s.precio}</td> {/* Precio */}
                    <td>{s.nombre || "No especificado"}</td> {/* Talla */}
                    <td>{s.nombreColor || "No especificado"}</td> {/* Color */}
                    <td>{s.stockActual}</td> {/* Stock */}
                    <td>{s.estadoProducto}</td> {/* Estado */}
                    <td>
                      <Link
                        to={`/stock/producto/${s.idProducto}`}
                        className="btn btn-light"
                      >
                        Agregar Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
