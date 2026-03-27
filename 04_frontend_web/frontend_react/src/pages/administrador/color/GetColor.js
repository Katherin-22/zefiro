import React, { useState, useEffect } from 'react';
import { getColor, deleteColor } from "../../../services/administrador/ColorService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/tablas-admin.css"; // 👈 CSS ÚNICO para todas las tablas
import { Link } from "react-router-dom";

export default function GetColor() {
  const [colores, setColores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColor = async () => {
      try {
        const response = await getColor();
        setColores(response.data);
      } catch (error) {
        console.error("Error al cargar el color", error);
      } finally {
        setLoading(false);
      }
    };

    fetchColor();
  }, []);

  const handleDeleteColor = async (idColor) => {
    try {
        await deleteColor(idColor);
        setColores(colores.filter(c => c.idColor !== idColor));
        alert("Color eliminado");
    } catch (error) {
        if (error.response?.status === 409) {
            alert(error.response.data);
        } else {
            alert("No se pudo eliminar el color");
        }
    }
  };

  if (loading) return <p>Cargando color...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-color">
        <div className="header">    
          <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">COLORES</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-admin">
              <Link to={"/crear_color"} className="btn custom-btn-admin btn-light">
                Registrar Color
              </Link>
            </div>
          </div>
        </div>      
        <div className="row">
          <div className="col">
            <div className="table-responsive-admin">
              <table className="table-admin">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {colores.map((color) => (
                    <tr key={color.idColor}>
                      <td>{color.nombreColor}</td>
                      <td>
                        <Link to={`/color/${color.idColor}`} className="btn-admin-editar">
                          Editar
                        </Link>
                        <button
                          className="btn-admin-eliminar"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de eliminar este color?")) {
                              handleDeleteColor(color.idColor);
                            }
                          }}
                        >
                          Eliminar
                        </button>
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