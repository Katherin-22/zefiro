import React, { useState, useEffect } from 'react';
import MenuAdmin from '../../../layouts/administrador/menuAdmin';
import styles from '../../../styles/administrador/gestionPedidos.module.css';
import { getPedido, actualizarEstadoPedido } from "../../../services/administrador/pedidos";
import { Link } from "react-router-dom";

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

    // 📌 FUNCIÓN PARA CAMBIAR ESTADO DEL PEDIDO
    const handleCambiarEstado = async (idPedido, nuevoEstado) => {
        try {
            setActualizandoEstado(idPedido);
            setMensajeError('');
            
            console.log("🔄 Cambiando estado:", { idPedido, nuevoEstado });
            
            const response = await actualizarEstadoPedido(idPedido, nuevoEstado);
            
            console.log("📦 Respuesta del backend:", response);
            console.log("📊 Datos:", response.data);
            
            if (response?.data) {
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

    // 📌 FUNCIÓN PARA SELECCIONAR TODOS
    const handleSelectAll = (e) => {
        const checkboxes = document.querySelectorAll(`.${styles.checkItem}`);
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
                            <div className={styles.spinnerBorderSm} role="status">
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
            <div className={`container-fluid ${styles.containerFluidGesPed}`} id='container-admin'>
                <div className="main-content">
                    <div className="container">
                        <div className="row border-bottom pb-2 mb-4">
                            <h2 className={`text-center mb-4 ${styles.textGestPed}`}>Gestión Pedidos</h2>
                        </div>

                        {/* Mensaje de error global */}
                        {mensajeError && (
                            <div className={`alert alert-dismissible fade show ${styles.alertDanger}`} role="alert">
                                {mensajeError}
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setMensajeError('')}
                                ></button>
                            </div>
                        )}

                        <div className={`row row-cols-md-3 g-4 mb-4 ${styles.rowEstado}`}>
                            <div className="col">
                                <h5>Mostrar por</h5>
                                <select 
                                    name="estado_pedido" 
                                    id="estado_pedido" 
                                    className={`form-select ${styles.formSelectEstado}`}
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
                                <div className={styles.tableResponsive}>
                                    <table className={`table ${styles.table}`}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        id="checkAll" 
                                                        className={styles.checkItem}
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
                                                        <tr className={styles.tablePrimary}>
                                                            <td>
                                                                <input 
                                                                    type="checkbox" 
                                                                    className={styles.checkItem} 
                                                                    value={pedido.idPedido}
                                                                />
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className={`btn btn-sm ${styles.btnMostrarProd}`}
                                                                    onClick={() => toggleExpandir(pedido.idPedido)}
                                                                    data-tooltip={pedidosExpandidos[pedido.idPedido] ? "Ocultar productos" : "Ver productos"}
                                                                >
                                                                    {pedidosExpandidos[pedido.idPedido] ? '▼' : '►'}
                                                                </button>
                                                                #{pedido.idPedido}
                                                            </td>
                                                            <td>{pedido.nombreUsuario}</td>
                                                            <td>
                                                                <select 
                                                                    className={`form-select form-select-sm ${styles.formSelectEstadoPed}`}
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
                                                                        <span className={styles.spinnerBorderSm} role="status"></span>
                                                                    </small>
                                                                )}
                                                            </td>
                                                            <td>{new Date(pedido.fechaPedido).toLocaleDateString()}</td>
                                                            <td className="fw-bold">${pedido.totalFinal?.toFixed(2) || '0.00'}</td>
                                                        </tr>
                                                        
                                                        {pedidosExpandidos[pedido.idPedido] && (
                                                            <tr>
                                                                <td colSpan="7" className="p-0">
                                                                    <table className={`table table-sm table-bordered mb-0 ${styles.tableSm}`}>
                                                                        <thead>
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
                                                                                        <small className="text-muted">{producto.codigoReferencia}</small><br/>
                                                                                        <span className="fw-medium">{producto.nombreProducto}</span>
                                                                                    </td>
                                                                                    <td>{producto.nombreColor || 'N/A'}</td>
                                                                                    <td>{producto.nombre || 'N/A'}</td>
                                                                                    <td className="text-center">{producto.cantidad}</td>
                                                                                    <td className="text-end">${producto.precioUnitario?.toFixed(2)}</td>
                                                                                    <td className="text-end fw-bold">${(producto.cantidad * producto.precioUnitario).toFixed(2)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                        <tfoot className="table-light">
                                                                            <tr>
                                                                                <td colSpan="5" className="text-end fw-bold">Total del Pedido:</td>
                                                                                <td className="text-end fw-bold text-primary">${pedido.totalFinal?.toFixed(2)}</td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className={`text-center ${styles.noUsers}`}>
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
        </div>
    );
};

export default GestionPedido;