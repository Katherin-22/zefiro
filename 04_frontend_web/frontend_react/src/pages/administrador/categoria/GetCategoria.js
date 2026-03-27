import React, { useState, useEffect } from 'react';
import { deleteCategoria, getCategorias } from "../../../services/administrador/CategoriaService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/tablas-admin.css"; // 👈 CSS ÚNICO para todas las tablas
import { Link } from "react-router-dom";

export default function GetCategoria() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchcategorias = async () => {
      try {
        const response = await getCategorias();
        setCategorias(response.data);
      } catch (error) {
        console.error("Error al cargar la Categoria", error);
      } finally {
        setLoading(false);
      }
    };

    fetchcategorias();
  }, []);

  const handleDeleteCategoria = async (idCategoria) => {
    try {
        await deleteCategoria(idCategoria);
        setCategorias(categorias.filter(p => p.idCategoria !== idCategoria));
        alert("Categoria eliminada");
    } catch (error) {
        if (error.response?.status === 409) {
            alert(error.response.data);
        } else {
            alert("No se pudo eliminar la categoria");
        }
    }
  };

  if (loading) return <p>Cargando categorias...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-categoria">
        <div className="header">    
          <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">CATEGORIAS</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-admin">
              <Link to="/categoria" className="btn custom-btn-admin btn-light">
                Registrar Categoria
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
                    <th>Tipo de Producto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria) => (
                    <tr key={categoria.idCategoria}>
                      <td>{categoria.nombreCategoria}</td>
                      <td>{categoria.nombreTipoProducto}</td>
                      <td>
                        <Link to={`/categoria/${categoria.idCategoria}`} className="btn-admin-editar">
                          Editar
                        </Link>
                        <button
                          className="btn-admin-eliminar"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de eliminar esta categoria?")) {
                              handleDeleteCategoria(categoria.idCategoria);
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