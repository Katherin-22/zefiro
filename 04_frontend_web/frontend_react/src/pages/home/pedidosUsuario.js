import React, { useState, useEffect } from 'react';
import { obtenerPedidosPorUsuario } from "../../services/administrador/pedidos";
import { Link, useNavigate } from "react-router-dom";
import api_url from '../../services/administrador/api';
import MenuHome from '../../layouts/home/menuHome';
import useAuth from '../../hooks/token/useAuth';

const PedidosUsuario = () => {
    const { userData, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pedidosExpandidos, setPedidosExpandidos] = useState({});
    const [formData, setFormData] = useState(null);

    const userId = userData?.id || userData?.idUsuario || null;

    const formatearCOP = (precio) => {
    if (!precio && precio !== 0) return '$0';
    
    // Convertir a número y redondear
    const valor = Math.round(Number(precio));
    
    // Formato colombiano: puntos para miles
    return '$' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
    
    // 📌 FUNCIÓN PARA AGRUPAR PEDIDOS (ADAPTADA A TU ESTRUCTURA)
    const agruparPedidos = (datos) => {
        console.log("📦 Datos a agrupar:", datos);
        
        return datos.reduce((acc, item) => {
            const pedidoExistente = acc.find(p => p.idPedido === item.idPedido);
            
            // Extraer productos del carrito.detalles
            const productos = item.carrito?.detalles?.map(detalle => {
                const stock = detalle.stock || {};
                const producto = stock.producto || {};
                const color = stock.color || {};
                const variacion = stock.variacion || {};
                
                return {
                    nombreProducto: producto.nombreProducto || 'Producto',
                    nombreColor: color.nombreColor || 'N/A',
                    nombreVariacion: variacion.nombre || 'N/A',
                    cantidad: detalle.cantidad || 0,
                    precioUnitario: detalle.precioUnitario || 0,
                    codigoReferencia: producto.codigoReferencia || 'N/A'
                };
            }) || [];
            
            console.log("📦 Productos extraídos:", productos);
            
            if (pedidoExistente) {
                // Si ya existe, agregamos los productos
                pedidoExistente.productos = [...pedidoExistente.productos, ...productos];
                // Recalculamos total
                pedidoExistente.totalFinal = pedidoExistente.productos.reduce(
                    (total, prod) => total + (prod.cantidad * prod.precioUnitario), 0
                );
            } else {
                // Nuevo pedido
                acc.push({
                    idPedido: item.idPedido,
                    fechaPedido: item.fechaPedido,
                    nombreUsuario: item.usuario?.nombreUsuario || 'Usuario',
                    estado: item.estado || 'Pendiente',
                    totalFinal: productos.reduce(
                        (total, prod) => total + (prod.cantidad * prod.precioUnitario), 0
                    ),
                    productos: productos
                });
            }
            return acc;
        }, []);
    };

    // 📌 useEffect para cargar perfil
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem("authToken")?.replace(/"/g, "");
                if (!token) {
                    setError("No se encontró el token de autenticación");
                    setLoading(false);
                    return;
                }

                const response = await api_url.get('/api/usuarios/perfil', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setFormData(response.data);
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    // 📌 useEffect para cargar pedidos
    useEffect(() => {
        const fetchPedidos = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("🔄 Cargando pedidos para usuario:", userId);
                
                const response = await obtenerPedidosPorUsuario(userId);
                
                console.log("📦 Respuesta completa:", response);
                
                if (response?.data) {
                    const datosArray = Array.isArray(response.data) ? response.data : [response.data];
                    
                    // Mostrar estructura del primer pedido
                    if (datosArray.length > 0) {
                        console.log("🔍 PRIMER PEDIDO:", datosArray[0]);
                        console.log("🔍 DETALLES:", datosArray[0].carrito?.detalles);
                    }
                    
                    const pedidosAgrupados = agruparPedidos(datosArray);
                    
                    console.log("✅ Pedidos agrupados:", pedidosAgrupados);
                    setPedidos(pedidosAgrupados);
                } else {
                    setPedidos([]);
                }
                
            } catch (error) {
                console.error("❌ Error al cargar pedidos:", error);
                if (error.response?.status === 404) {
                    setPedidos([]);
                    setError(null);
                } else {
                    setError(error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [userId]);

    const toggleExpandir = (idPedido) => {
        setPedidosExpandidos(prev => ({
            ...prev,
            [idPedido]: !prev[idPedido]
        }));
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        try {
            return new Date(fecha).toLocaleDateString('es-ES');
        } catch (e) {
            return fecha;
        }
    };

    if (!isAuthenticated || !userId) {
        return (
            <div className="all">
                <MenuHome />
                <div className="container-fluid" id='container-admin'>
                    <div className="main-content">
                        <div className="container text-center mt-5">
                            <div className="alert alert-warning">
                                <h4>Acceso Restringido</h4>
                                <p>Debes iniciar sesión para ver tus pedidos.</p>
                                <Link to="/loginpage" className="btn btn-primary">
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="all">
                <MenuHome />
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
            <MenuHome />
            <div className="container-fluid" id='container-pedidos'>
                <div className="main-content">
                    <div className="container">
                        <div className="row border-bottom pb-2 mb-4">
                            <h2 className="text-center mb-4">Mis Pedidos</h2>
                            {formData && (
                                <p className="text-muted text-center">
                                    Cliente: {formData.nombreUsuario || formData.nombre} {formData.primerApellido || ''}
                                </p>
                            )}
                        </div>

                        <div className="row">
                            <div className="col">
                                {pedidos.length === 0 ? (
                                    <div className="alert alert-info text-center">
                                        No tienes pedidos realizados.
                                    </div>
                                ) : (
                                    <table className="table table-bordered">
                                        <thead className="table-dark">
                                            <tr>
                                                <th style={{ width: '50px' }}></th>
                                                <th>ID Pedido</th>
                                                <th>Estado</th>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pedidos.map((pedido) => (
                                                <React.Fragment key={pedido.idPedido}>
                                                    <tr className="table-primary fw-bold">
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => toggleExpandir(pedido.idPedido)}
                                                            >
                                                                {pedidosExpandidos[pedido.idPedido] ? '▼' : '►'}
                                                            </button>
                                                        </td>
                                                        <td>{pedido.idPedido}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                pedido.estado === 'Entregado' ? 'bg-success' :
                                                                pedido.estado === 'Cancelado' ? 'bg-danger' :
                                                                pedido.estado === 'Enviado' ? 'bg-info' :
                                                                pedido.estado === 'Pagado' ? 'bg-primary' :
                                                                'bg-warning'
                                                            }`}>
                                                                {pedido.estado}
                                                            </span>
                                                        </td>
                                                        <td>{formatearFecha(pedido.fechaPedido)}</td>
<td>{formatearCOP(pedido.totalFinal)}</td>                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => navigate(`/pedido-detalle/${pedido.idPedido}`)}
                                                            >
                                                                Ver detalles
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    
                                                    {pedidosExpandidos[pedido.idPedido] && (
                                                        <tr>
                                                            <td colSpan="6" className="p-0">
                                                                <div className="p-3">
                                                                    <h6 className="mb-3">Productos:</h6>
                                                                    <table className="table table-sm table-bordered mb-0">
                                                                        <thead className="table-secondary">
                                                                            <tr>
                                                                                <th>Producto</th>
                                                                                <th>Color</th>
                                                                                <th>Talla</th>
                                                                                <th className="text-center">Cantidad</th>
                                                                                <th className="text-end">Precio Unit.</th>
                                                                                <th className="text-end">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {pedido.productos?.map((producto, idx) => {
                                                                                const cantidad = Number(producto.cantidad) || 0;
                                                                                const precio = Number(producto.precioUnitario) || 0;
                                                                                const subtotal = cantidad * precio;
                                                                                
                                                                                return (
                                                                                    <tr key={idx}>
                                                                                        <td>
                                                                                            <strong>{producto.nombreProducto}</strong>
                                                                                            {producto.codigoReferencia && (
                                                                                                <small className="d-block text-muted">
                                                                                                    Ref: {producto.codigoReferencia}
                                                                                                </small>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>{producto.nombreColor}</td>
                                                                                        <td>{producto.nombreVariacion}</td>
                                                                                        <td className="text-center">{cantidad}</td>
                                                                                        <td className="text-end">{formatearCOP(producto.precioUnitario)}</td>
                                                                                        <td className="text-end fw-bold">{formatearCOP(subtotal)}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                        <tfoot className="table-light">
                                                                            <tr>
                                                                                <td colSpan="5" className="text-end fw-bold">Total del pedido:</td>
                                                                                <td className="text-end fw-bold text-success">
                                                                                    <td>{formatearCOP(pedido.totalFinal)}</td>
                                                                                </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <p className="text-muted">
                                        Total de pedidos: <strong>{pedidos.length}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PedidosUsuario;