import MenuAdmin from '../../../layouts/administrador/menuAdmin';
import '../../../styles/administrador/gestion_producto.css';
import '../../../styles/administrador/inventario.css';
import React, { useState, useEffect } from 'react';
import { getPedido, actualizarEstadoPedido } from "../../../services/administrador/pedidos";
import { Link } from "react-router-dom";
import "../../../styles/administrador/gestionPedidos.css"

const GestionPedido = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pedidosExpandidos, setPedidosExpandidos] = useState({});
    const [filtroEstado, setFiltroEstado] = useState('');
    const [actualizandoEstado, setActualizandoEstado] = useState(null);
    const [mensajeError, setMensajeError] = useState('');

    // 📌 FUNCIÓN PARA AGRUPAR PEDIDOS
    const agruparPedidos = (datos) => {
        return datos.reduce((acc, item) => {
            const pedidoExistente = acc.find(p => p.idPedido === item.idPedido);
            
            if (pedidoExistente) {
                pedidoExistente.productos.push({
                    nombreProducto: item.nombreProducto,
                    nombreColor: item.nombreColor,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precioUnitario,
                    codigoReferencia: item.codigoReferencia
                });
                pedidoExistente.totalFinal = (pedidoExistente.totalFinal || 0) + 
                    (item.cantidad * item.precioUnitario);
            } else {
                acc.push({
                    idPedido: item.idPedido,
                    fechaPedido: item.fechaPedido,
                    nombreUsuario: item.nombreUsuario,
                    estado: item.estado || 'Pendiente',
                    totalFinal: item.cantidad * item.precioUnitario,
                    productos: [{
                        nombreProducto: item.nombreProducto,
                        nombreColor: item.nombreColor,
                        nombre: item.nombre,
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
                
                if (response?.data) {
                    const datosArray = Array.isArray(response.data) ? response.data : [response.data];
                    const pedidosAgrupados = agruparPedidos(datosArray);
                    setPedidos(pedidosAgrupados);
                } else {
                    setPedidos([]);
                }
            } catch (error) {
                console.error("❌ Error al cargar pedidos:", error);
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

 // 📌 FUNCIÓN PARA CAMBIAR ESTADO DEL PEDIDO (MEJORADA)
const handleCambiarEstado = async (idPedido, nuevoEstado) => {
    try {
        setActualizandoEstado(idPedido);
        setMensajeError('');
        
        console.log("🔄 Cambiando estado:", { idPedido, nuevoEstado });
        
        const response = await actualizarEstadoPedido(idPedido, nuevoEstado);
        
        console.log("📦 Respuesta del backend:", response);
        console.log("📊 Datos:", response.data);
        
        if (response?.data) {
            // Actualizar el estado local
            setPedidos(prevPedidos => 
                prevPedidos.map(pedido => 
                    pedido.idPedido === idPedido 
                        ? { ...pedido, estado: response.data.estado || nuevoEstado }
                        : pedido
                )
            );
            
            alert(`✅ Estado del pedido #${idPedido} actualizado a: ${nuevoEstado}`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
        
        // Extraer mensaje de error
        let errorMsg = 'Error al actualizar el estado';
        if (error.response?.data) {
            errorMsg = typeof error.response.data === 'object' 
                ? JSON.stringify(error.response.data) 
                : error.response.data;
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        setMensajeError(`Error: ${errorMsg}`);
        alert(`❌ Error: ${errorMsg}`);
    } finally {
        setActualizandoEstado(null);
    }
};
    // 📌 FUNCIÓN PARA FILTRAR PEDIDOS POR ESTADO
    const pedidosFiltrados = pedidos.filter(pedido => {
        if (!filtroEstado) return true;
        return pedido.estado === filtroEstado;
    });

    // 📌 FUNCIONES PARA ACCIONES
    const handleVerPedido = (idPedido) => {
        console.log("Ver pedido:", idPedido);
    };

    const handleEditarPedido = (idPedido) => {
        console.log("Editar pedido:", idPedido);
    };

    // 📌 FUNCIÓN PARA SELECCIONAR TODOS
    const handleSelectAll = (e) => {
        const checkboxes = document.querySelectorAll('.check-item');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
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

    return (
        <div className="all">
            <MenuAdmin />
            <div className="container-fluid container-fluid-gesPed" id='container-admin'>
                <div className="main-content">
                    <div className="container">
                        <div className="row border-bottom pb-2 mb-4">
                            <h2 className="text-center mb-4 text-gestPed">Gestión Pedidos</h2>
                        </div>

                        {/* Mensaje de error global */}
                        {mensajeError && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {mensajeError}
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setMensajeError('')}
                                ></button>
                            </div>
                        )}

                        <div className="row row-cols-md-3 g-4 mb-4 row-estado">
                            <div className="col">
                                <h5>Mostrar por</h5>
                                <select 
                                    name="estado_pedido" 
                                    id="estado_pedido" 
                                    className="form-select form-select-estado"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Procesando">Procesando</option>
                                    <option value="Entregado">Entregado</option>
                                </select>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    id="checkAll" 
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th>ID Pedido</th>
                                            <th>Cliente</th>
                                            <th>Estado</th>
                                            <th>Fecha</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidosFiltrados.length > 0 ? (
                                            pedidosFiltrados.map((pedido) => (
                                                <React.Fragment key={pedido.idPedido}>
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
                                                                className="btn btn-sm btn-mostarProd btn-outline-secondary me-2"
                                                                onClick={() => toggleExpandir(pedido.idPedido)}
                                                            >
                                                                {pedidosExpandidos[pedido.idPedido] ? '▼' : '►'}
                                                            </button>
                                                            #{pedido.idPedido}
                                                        </td>
                                                        <td>{pedido.nombreUsuario}</td>
                                                        <td>
                                                            <select 
                                                                className="form-select form-select-sm form-select-estadoPed"
                                                                value={pedido.estado}
                                                                onChange={(e) => handleCambiarEstado(pedido.idPedido, e.target.value)}
                                                                disabled={actualizandoEstado === pedido.idPedido}
                                                                style={{
                                                                    backgroundColor: 
                                                                        pedido.estado === 'Pendiente' ? '#fff3cd' :
                                                                        pedido.estado === 'Procesando' ? '#9cd8d5' :
                                                                        pedido.estado === 'Entregado' ? '#d1e7dd' : 'white'
                                                                }}
                                                            >
                                                                <option value="Pendiente">Pendiente</option>
                                                                <option value="Procesando">Procesando</option>
                                                                <option value="Entregado">Entregado</option>
                                                            </select>
                                                            {actualizandoEstado === pedido.idPedido && (
                                                                <small className="ms-2 text-primary">
                                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                </small>
                                                            )}
                                                        </td>
                                                        <td>{new Date(pedido.fechaPedido).toLocaleDateString()}</td>
                                                        <td>${pedido.totalFinal?.toFixed(2) || '0.00'}</td>
                                                    </tr>
                                                    
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
                                                                                <td>
                                                                                    <small>{producto.codigoReferencia}</small><br/>
                                                                                    {producto.nombreProducto}
                                                                                </td>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionPedido;