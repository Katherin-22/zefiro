import React, { useState, useEffect } from 'react';
import { deleteMarca, getMarca } from "../../../services/administrador/MarcaService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/marca.css"; // 👈 Nuevo archivo CSS
import { Link } from "react-router-dom";

export default function GetMarca() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer las marcas al cargar la página
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await getMarca();
        setMarcas(response.data);
      } catch (error) {
        console.error("Error al cargar la marca", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  // Eliminar marca directamente desde el service
  const handleDeleteMarca = async (idMarca) => {
    try {
        await deleteMarca(idMarca);
        setMarcas(marcas.filter(m => m.idMarca !== idMarca));
        alert("Marca eliminada");
    } catch (error) {
        if (error.response?.status === 409) {
            alert(error.response.data);
        } else {
            alert("No se pudo eliminar la marca");
        }
    }
  };

  if (loading) return <p>Cargando marcas...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-marca">
        <div className="header">    
          <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">MARCAS</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-Marca">
              <Link to="/crear_marca" className="btn custom-btn-marca btn-light">
                Registrar Marca
              </Link>
            </div>
          </div>
        </div>      
        <div className="row">
          <div className="col">
            <div className="table-responsive-marca">
              <table className="table-marca">
                <thead>
                  <tr>
                    <th>Nombre marca</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {marcas.map((marca) => (
                    <tr key={marca.idMarca}>
                      <td>{marca.nombreMarca}</td>
                      <td>
                        <Link to={`/marca/${marca.idMarca}`} className="btn-marca-editar">
                          Editar
                        </Link>
                        <button
                          className="btn-marca-eliminar"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de eliminar esta marca?")) {
                              handleDeleteMarca(marca.idMarca);
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