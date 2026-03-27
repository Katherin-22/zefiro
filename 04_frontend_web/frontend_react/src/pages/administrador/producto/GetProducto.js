import React, { useState, useEffect } from 'react';
import { deleteProducto, getProductos } from "../../../services/administrador/ProductoService";
import MenuAdmin from "../../../layouts/administrador/menuAdmin";

import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/producto.css"; // 👈 Nuevo archivo CSS
import { Link } from "react-router-dom";

export default function GetProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer los productos al cargar la página
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getProductos();
        setProductos(response.data);
      } catch (error) {
        console.error("Error al cargar productos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Eliminar producto directamente desde el service
  const handleDeleteProducto = async (idProducto) => {
    try {
        await deleteProducto(idProducto);
        setProductos(productos.filter(p => p.idProducto !== idProducto));
        alert("Producto eliminado");
    } catch (error) {
        if (error.response?.status === 409) {
            alert(error.response.data);
        } else {
            alert("No se pudo eliminar el producto");
        }
    }
  };

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="main-content">
      <nav>
        <MenuAdmin />
      </nav>
      <div className="container-fluid" id="container-admin-producto">
        <div className="header">    
          <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
              <h1 className="mb-0">PRODUCTO</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-9 d-flex align-items-end px-1 gap-2 w-50 isla-Producto">
              <Link to="/crear_producto" className="btn custom-btn-producto btn-light">Registrar Producto</Link>
              <Link to="/ver_marca" className="btn custom-btn-producto btn-light">Marca</Link>
              <Link to="/ver_material" className="btn custom-btn-producto btn-light">Material</Link>
            </div>
          </div>
        </div>      
        <div className="row">
          <div className="col">
            <div className="table-responsive-producto">
              <table className="table-producto">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Marca</th>
                    <th>Material</th>
                    <th>Género</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Fecha Modificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.idProducto}>
                      <td>{producto.codigoReferencia}</td>
                      <td>{producto.nombreProducto}</td>
                      <td>{producto.nombreTipoProducto}</td>
                      <td>{producto.nombreCategoria}</td>
                      <td>{producto.descripcion}</td>
                      <td>${producto.precio}</td>
                      <td>{producto.nombreMarca}</td>
                      <td>{producto.nombreMaterial}</td>
                      <td>{producto.nombrePublico}</td>
                      <td>
                        <span className={`estado-badge ${producto.estadoProducto === 'Activo' ? 'activo' : 'inactivo'}`}>
                          {producto.estadoProducto}
                        </span>
                      </td>
                      <td>{new Date(producto.fechaCreacion).toLocaleDateString()}</td>
                      <td>{new Date(producto.fechaModificacion).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/producto/${producto.idProducto}`} className="btn-producto-editar">
                          Editar
                        </Link>
                        <Link to={`/producto/${producto.idProducto}/imagenes`} className="btn-producto-imagenes">
                          Imágenes
                        </Link>
                        <button
                          className="btn-producto-eliminar"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de eliminar este producto?")) {
                              handleDeleteProducto(producto.idProducto);
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