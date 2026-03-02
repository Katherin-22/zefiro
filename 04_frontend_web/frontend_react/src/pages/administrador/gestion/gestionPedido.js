import MenuAdmin from '../../../layouts/administrador/menuAdmin';
import '../../../styles/administrador/gestion_producto.css';
import '../../../styles/administrador/inventario.css';
import React, { useState, useEffect } from 'react';
import { getPedido } from "../../../services/administrador/pedidos";
import { Link } from "react-router-dom";

const GestionPedido = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pedidosExpandidos, setPedidosExpandidos] = useState({});

    // 📌 FUNCIÓN PARA AGRUPAR PEDIDOS
    const agruparPedidos = (datos) => {
        return datos.reduce((acc, item) => {
            const pedidoExistente = acc.find(p => p.idPedido === item.idPedido);
            
            if (pedidoExistente) {
                // Si el pedido ya existe, agregamos el producto a su lista
                pedidoExistente.productos.push({
                    nombreProducto: item.nombreProducto,
                    nombreColor: item.nombreColor,
                    nombreVariacion: item.nombreVariacion,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    codigoReferencia: item.codigoReferencia
                });
                // Actualizamos el total
                pedidoExistente.totalFinal = (pedidoExistente.totalFinal || 0) + 
                    (item.cantidad * item.precioUnitario);
            } else {
                // Si es un nuevo pedido, lo creamos con su primer producto
                acc.push({
                    idPedido: item.idPedido,
                    fechaPedido: item.fechaPedido,
                    nombreUsuario: item.nombreUsuario,
                    estado: item.estado || 'Pendiente',
                    totalFinal: item.cantidad * item.precioUnitario,
                    productos: [{
                        nombreProducto: item.nombreProducto,
                        nombreColor: item.nombreColor,
                        nombreVariacion: item.nombreVariacion,
                        cantidad: item.cantidad,
                        precioUnitario: item.precioUnitario,
                        codigoReferencia: item.codigoReferencia
                    }]
                });
            }
            return acc;
        }, []);
    };

    // 📌 useEffect PARA CARGAR DATOS
    useEffect(() => {
        const fetchPedido = async () => {
            try {
                console.log("🔄 Cargando pedidos...");
                
                const response = await getPedido();
                
                console.log("📦 Respuesta completa:", response);
                console.log("📊 Datos recibidos:", response.data);
                
                if (response?.data) {
                    const datosArray = Array.isArray(response.data) ? response.data : [response.data];
                    
                    // 👇 AGRUPAMOS LOS PEDIDOS
                    const pedidosAgrupados = agruparPedidos(datosArray);
                    
                    setPedidos(pedidosAgrupados);
                    console.log("✅ Pedidos agrupados:", pedidosAgrupados);
                } else {
                    console.warn("⚠️ No hay datos en la respuesta");
                    setPedidos([]);
                }
                
            } catch (error) {
                console.error("❌ Error al cargar pedidos:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedido();
    }, []);

    // 📌 FUNCIÓN PARA EXPANDIR/COLAPSAR PRODUCTOS
    const toggleExpandir = (idPedido) => {
        setPedidosExpandidos(prev => ({
            ...prev,
            [idPedido]: !prev[idPedido]
        }));
    };

    // 📌 FUNCIONES PARA ACCIONES
    const handleVerPedido = (idPedido) => {
        console.log("Ver pedido:", idPedido);
    };

    const handleEditarPedido = (idPedido) => {
        console.log("Editar pedido:", idPedido);
    };

    const handleCambiarEstado = (idPedido, nuevoEstado) => {
        console.log("Cambiar estado:", idPedido, nuevoEstado);
    };

    // 📌 RENDERIZADO CONDICIONAL
    if (loading) {
        return (
            <div className="all">
                <MenuAdmin />
                <div className="container-fluid" id='container-admin'>
                    <div className="main-content">
                        <div className="container text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Cargando pedidos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="all">
                <MenuAdmin />
                <div className="container-fluid" id='container-admin'>
                    <div className="main-content">
                        <div className="container">
                            <div className="alert alert-danger" role="alert">
                                Error al cargar los pedidos: {error}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="all">
            <MenuAdmin />
            <div className="container-fluid" id='container-admin'>
                <div className="main-content">
                    <div className="container">
                        <div className="row border-bottom pb-2 mb-4">
                            <h2 className="text-center mb-4">Gestión Pedidos</h2>
                        </div>

                        <div className="row row-cols-md g-4 mb-4">
                            <div className="col">
                                <Link to="/Administrador/Gestion_Devoluciones" className="btn btn-outline-secondary w-100">
                                    Gestión Devoluciones
                                </Link>
                            </div>
                        </div>

                        <div className="row row-cols-md-3 g-4 mb-4">
                            <div className="col">
                                <select name="estado_pedido" id="estado_pedido" className="form-select">
                                    <option value="">Todos los estados</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Entregado">Entregado</option>
                                </select>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-primary w-100">
                                    Ver historial
                                </button>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-success w-100">
                                    Agregar Manualmente
                                </button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input type="checkbox" id="checkAll" />
                                            </th>
                                            <th>ID Pedido</th>
                                            <th>Cliente</th>
                                            <th>Estado</th>
                                            <th>Fecha</th>
                                            <th>Total</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidos.length > 0 ? (
                                            pedidos.map((pedido) => (
                                                <React.Fragment key={pedido.idPedido}>
                                                    {/* Fila principal del pedido */}
                                                    <tr className="table-primary fw-bold">
                                                        <td>
                                                            <input 
                                                                type="checkbox" 
                                                                className="check-item" 
                                                                value={pedido.idPedido}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary me-2"
                                                                onClick={() => toggleExpandir(pedido.idPedido)}
                                                            >
                                                                {pedidosExpandidos[pedido.idPedido] ? '▼' : '►'}
                                                            </button>
                                                            {pedido.idPedido}
                                                        </td>
                                                        <td>{pedido.nombreUsuario}</td>
                                                        <td>
                                                            <select 
                                                                className="form-select form-select-sm"
                                                                value={pedido.estado}
                                                                onChange={(e) => handleCambiarEstado(pedido.idPedido, e.target.value)}
                                                            >
                                                                <option value="Pendiente">Pendiente</option>
                                                                <option value="En proceso">En proceso</option>
                                                                <option value="Entregado">Entregado</option>
                                                            </select>
                                                        </td>
                                                        <td>{pedido.fechaPedido}</td>
                                                        <td>${pedido.totalFinal?.toFixed(2) || '0.00'}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-info me-2"
                                                                onClick={() => handleVerPedido(pedido.idPedido)}
                                                            >
                                                                Ver
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-warning"
                                                                onClick={() => handleEditarPedido(pedido.idPedido)}
                                                            >
                                                                Editar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Productos del pedido (expandible) */}
                                                    {pedidosExpandidos[pedido.idPedido] && (
                                                        <tr>
                                                            <td colSpan="7" className="p-0">
                                                                <table className="table table-sm table-bordered mb-0">
                                                                    <thead className="table-secondary">
                                                                        <tr>
                                                                            <th>Producto</th>
                                                                            <th>Color</th>
                                                                            <th>Variación</th>
                                                                            <th>Cantidad</th>
                                                                            <th>Precio Unit.</th>
                                                                            <th>Subtotal</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {pedido.productos?.map((producto, idx) => (
                                                                            <tr key={`${pedido.idPedido}-${idx}`}>
                                                                                <td>{producto.nombreProducto}</td>
                                                                                <td>{producto.nombreColor || 'N/A'}</td>
                                                                                <td>{producto.nombre || 'N/A'}</td>
                                                                                <td>{producto.cantidad}</td>
                                                                                <td>${producto.precioUnitario?.toFixed(2)}</td>
                                                                                <td>${(producto.cantidad * producto.precioUnitario).toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    No hay pedidos para mostrar
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Contador de pedidos */}
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <p className="text-muted">
                                        Total de pedidos: <strong>{pedidos.length}</strong>
                                    </p>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={async () => {
                                            try {
                                                const { contarPedidos } = await import("../../../services/administrador/pedidos");
                                                const response = await contarPedidos();
                                                alert(`Total de pedidos en BD: ${response.data}`);
                                            } catch (error) {
                                                console.error("Error al contar pedidos:", error);
                                            }
                                        }}
                                    >
                                        Actualizar contador
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionPedido;