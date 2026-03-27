import React, { useState, useEffect } from 'react';
import { deleteMaterial, getMateriales } from "../../../services/administrador/MaterialService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/material.css"; // 👈 Nuevo archivo CSS
import { Link } from "react-router-dom";

export default function GetMaterial() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer los materiales al cargar la página
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await getMateriales();
        setMateriales(response.data);
      } catch (error) {
        console.error("Error al cargar el material", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMateriales();
  }, []);

  // Eliminar material directamente desde el service
  const handleDeleteMaterial = async (idMaterial) => {
    try {
        await deleteMaterial(idMaterial);
        setMateriales(materiales.filter(m => m.idMaterial !== idMaterial));
        alert("Material eliminado");
    } catch (error) {
        if (error.response?.status === 409) {
            alert(error.response.data);
        } else {
            alert("No se pudo eliminar el material");
        }
    }
  };

  if (loading) return <p>Cargando material...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-material">
        <div className="header">    
          <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">MATERIALES</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-Material">
              <Link to="/crear_material" className="btn custom-btn-material btn-light">
                Registrar material
              </Link>
            </div>
          </div>
        </div>      
        <div className="row">
          <div className="col">
            <div className="table-responsive-material">
              <table className="table-material">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materiales.map((material) => (
                    <tr key={material.idMaterial}>
                      <td>{material.nombreMaterial}</td>
                      <td>
                        <Link to={`/material/${material.idMaterial}`} className="btn-material-editar">
                          Editar
                        </Link>
                        <button
                          className="btn-material-eliminar"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de eliminar este material?")) {
                              handleDeleteMaterial(material.idMaterial);
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