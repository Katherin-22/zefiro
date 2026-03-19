import React, { useState, useEffect } from 'react';
import { getPromociones, deletePromocion } from "../../../services/administrador/PromocionService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/promocion.css";
import { Link } from 'react-router-dom';

export default function GetPromocion() {
  const [promocion, setPromocion] = useState([]);
  const [loading, setLoading] = useState(true);  

  // Traer las promociones al cargar la página
  useEffect(() => {
    const fetchPromocion = async () => {
      try {
        const response = await getPromociones();
        console.log("promocion desde API:", response.data);
        setPromocion(response.data);
      } catch (error) {
        console.error("Error al cargar la promocion", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromocion();
  }, []);

  // Eliminar promoción
  const handleDeletePromocion = async (idPromocion) => {
    try {
        await deletePromocion(idPromocion);
        setPromocion(promocion.filter(p => p.idPromocion !== idPromocion));
        alert("Promoción eliminada");
    } catch (error) {
        if (error.response?.status === 409) {
            alert(error.response.data);
        } else {
          alert("No se pudo eliminar la promocion. Revisa si tiene relaciones activas.");
        }
    }
  };

  if (loading) return <p>Cargando promocion...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-promocion">
        <div className="header">    
          <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">PROMOCIÓN</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-Promocion">
              <Link to="/crear_promocion" className="btn custom-btn-promocion btn-light">
                Registrar promoción
              </Link>
            </div>
          </div>
        </div>      
        <div className="row">
          <div className="col">
            <div className="table-responsive-promocion">
              <table className="table-promocion">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código promoción</th>
                    <th>Descuento</th>
                    <th>Descripción</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promocion.map((p) => (
                    <tr key={p.idPromocion}>
                      <td>{p.nombrePromocion}</td>
                      <td>{p.codigoPromocion}</td>
                      <td>{p.descuento}%</td>
                      <td>{p.descripcion}</td>
                      <td>{new Date(p.fechaInicio).toLocaleDateString()}</td>
                      <td>{new Date(p.fechaFin).toLocaleDateString()}</td>
                      <td>
                        <span className={`estado-badge ${p.estadoPromocion === 'Activo' ? 'activo' : 'inactivo'}`}>
                          {p.estadoPromocion}
                        </span>
                      </td>
                      <td>
                        <Link to={`/promocion/${p.idPromocion}`} className="btn-promocion-editar">
                          Editar
                        </Link>
                        <button
                          className="btn-promocion-eliminar"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de eliminar esta promoción?")) {
                              handleDeletePromocion(p.idPromocion);
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