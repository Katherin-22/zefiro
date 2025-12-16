import React, { useState, useEffect } from 'react';
import { getCarrito } from "../../services/carrito/carritoService";
import { getDetalleCarrito } from "../../services/carrito/detalleCarritoService";
import MenuAdmin from "../../layouts/administrador/menuAdmin";

import "../../styles/administrador/inventario.css";
import "../../styles/administrador/gestion_producto.css";
import { Link } from "react-router-dom";


export default function GetCarrito() {
  // Usamos el hook
  const [carrito, setCarrito] = useState([]);
  const [detalleCarrito, setDetalleCarrito] = useState([])
  const [loading, setLoading] = useState(true);

  // Traer los productos al cargar la página
  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const response = await getCarrito(); // llama tu endpoint
        setCarrito(response.data); // guarda productos en el estado
      } catch (error) {
        console.error("Error al cargar carrito", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrito();
  }, []);

  // Traer los productos al cargar la página
  useEffect(() => {
    const fetchDetalleCarrito = async () => {
      try {
        const response = await getDetalleCarrito(); // llama tu endpoint
        setDetalleCarrito(response.data); // guarda productos en el estado
      } catch (error) {
        console.error("Error al cargar el detalle del carrito", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleCarrito();
  }, []);

  if (loading) return <p>Cargando carrito...</p>;
  return (

<div className="main-content">
    <nav>
        <MenuAdmin />
    </nav>
    <div className="header">    
        <div className="row custom-header">
            <div className="col-3 d-flex align-items-center justify-content-between">
                <h1 className="mb-0">carrito</h1>
            </div>
        </div>
    </div>      
        <div className="row">
            <div className="col">
                <table>
                    <thead>
                        <tr>
                        <th>Código</th>
                        <th>nombre</th>
                        <th>Tipo</th>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th>Precio de Venta</th>
                        <th>Marca</th>
                        <th>Material</th>
                        <th>Género</th>
                        <th>Acciones</th>
                        </tr>
                    </thead>
                        <tbody>
                        {detalleCarrito.map((c) => (
                            <tr key={c.idCarrito}>
                            <td>{c.precioUnitario}</td>
                            <td>{c.cantidad}</td>
                            <td>{c.descuentoProd}</td>
                            <td>{c.subtotal}</td>
                            <td>{c.nombreProducto}</td>
                            <td>{c.precio}</td>
                            <td>{c.nombre}</td>
                            <td>{c.nombreColor}</td>
                            <td><Link to={`/producto/${c.idProducto}`} id="boton_agregar" className="btn btn-light">Editar</Link>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                </table>
            </div>
        </div>
</div>
  )
}
