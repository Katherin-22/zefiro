// src/pages/administrador/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import MenuAdmin from '../../../layouts/administrador/menuAdmin';
import api_url from "../../../services/administrador/api";
import '../../../styles/administrador/inventario.css';

// Servicios
import { getPedido } from "../../../services/administrador/pedidos";

const DashboardAdmin = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para los datos
    const [pedidos, setPedidos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [productos, setProductos] = useState([]);
    
    // Estados para filtros
    const [filtroFecha, setFiltroFecha] = useState({
        inicio: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Primer día del mes
        fin: new Date().toISOString().split('T')[0] // Hoy
    });
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroProducto, setFiltroProducto] = useState('todos');
    
    // Lista de productos para el filtro
    const [listaProductos, setListaProductos] = useState([]);

    // ============================================
    // FUNCIÓN PARA AGRUPAR PEDIDOS
    // ============================================
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

    // ============================================
    // CARGAR TODOS LOS DATOS
    // ============================================
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("authToken")?.replace(/"/g, "");

                // 1. Cargar pedidos (usando tu servicio existente)
                const pedidosResponse = await getPedido();
                if (pedidosResponse?.data) {
                    const datosArray = Array.isArray(pedidosResponse.data) ? pedidosResponse.data : [pedidosResponse.data];
                    const pedidosAgrupados = agruparPedidos(datosArray);
                    setPedidos(pedidosAgrupados);
                    
                    // Extraer productos únicos para el filtro
                    const productosUnicos = [];
                    datosArray.forEach(item => {
                        if (item.nombreProducto && !productosUnicos.find(p => p.nombre === item.nombreProducto)) {
                            productosUnicos.push({
                                nombre: item.nombreProducto,
                                codigo: item.codigoReferencia,
                                id: item.idProducto
                            });
                        }
                    });
                    setListaProductos(productosUnicos);
                }

                // 2. Cargar usuarios (con tu api_url)
                if (token) {
                    const usuariosResponse = await api_url.get("/api/usuarios", {
                        headers: { 
                            'Authorization': `Bearer ${token}` 
                        }
                    });
                    
                    if (usuariosResponse.data) {
                        // Filtrar solo usuarios con rol 1 (clientes)
                        const clientes = usuariosResponse.data.filter(u => u.rol?.idRol === 1);
                        setUsuarios(clientes);
                    }
                }

                // 3. Cargar productos (endpoint público)
                const productosResponse = await api_url.get("/publico/productos");
                if (productosResponse.data) {
                    setProductos(productosResponse.data);
                }

            } catch (error) {
                console.error("Error cargando datos:", error);
                setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    // ============================================
    // FUNCIONES DE FILTRADO
    // ============================================
    
    // Filtrar pedidos por fecha, estado y producto
    const pedidosFiltrados = pedidos.filter(pedido => {
        // Filtro por fecha
        const fechaPedido = new Date(pedido.fechaPedido).toISOString().split('T')[0];
        const cumpleFecha = fechaPedido >= filtroFecha.inicio && fechaPedido <= filtroFecha.fin;
        
        // Filtro por estado
        const cumpleEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
        
        // Filtro por producto
        let cumpleProducto = true;
        if (filtroProducto !== 'todos') {
            cumpleProducto = pedido.productos?.some(p => 
                p.nombreProducto === filtroProducto || 
                p.codigoReferencia === filtroProducto
            );
        }
        
        return cumpleFecha && cumpleEstado && cumpleProducto;
    });

    // Productos más vendidos
    const productosMasVendidos = () => {
        const ventas = {};
        
        pedidosFiltrados.forEach(pedido => {
            pedido.productos?.forEach(producto => {
                const key = producto.nombreProducto || producto.codigoReferencia;
                if (!ventas[key]) {
                    ventas[key] = {
                        nombre: producto.nombreProducto,
                        codigo: producto.codigoReferencia,
                        cantidad: 0,
                        total: 0,
                        vecesVendido: 0
                    };
                }
                ventas[key].cantidad += producto.cantidad || 0;
                ventas[key].total += (producto.cantidad * producto.precioUnitario) || 0;
                ventas[key].vecesVendido += 1;
            });
        });
        
        return Object.values(ventas).sort((a, b) => b.cantidad - a.cantidad);
    };

    // Ventas por día
    const ventasPorDia = () => {
        const ventas = {};
        
        pedidosFiltrados.forEach(pedido => {
            const fecha = new Date(pedido.fechaPedido).toLocaleDateString();
            if (!ventas[fecha]) {
                ventas[fecha] = {
                    fecha,
                    total: 0,
                    cantidad: 0,
                    pedidos: 0
                };
            }
            ventas[fecha].total += pedido.totalFinal || 0;
            ventas[fecha].cantidad += pedido.productos?.reduce((sum, p) => sum + (p.cantidad || 0), 0) || 0;
            ventas[fecha].pedidos += 1;
        });
        
        return Object.values(ventas).sort((a, b) => 
            new Date(a.fecha) - new Date(b.fecha)
        );
    };

    // Estadísticas por estado
    const statsPorEstado = () => {
        const stats = {
            Pendiente: 0,
            En_proceso: 0,
            Entregado: 0
        };
        
        pedidosFiltrados.forEach(pedido => {
            if (stats[pedido.estado] !== undefined) {
                stats[pedido.estado]++;
            }
        });
        
        return stats;
    };

    // Ventas por producto específico (si está seleccionado)
    const ventasProductoSeleccionado = () => {
        if (filtroProducto === 'todos') return null;
        
        let cantidadTotal = 0;
        let ingresosTotal = 0;
        
        pedidosFiltrados.forEach(pedido => {
            pedido.productos?.forEach(producto => {
                if (producto.nombreProducto === filtroProducto || producto.codigoReferencia === filtroProducto) {
                    cantidadTotal += producto.cantidad || 0;
                    ingresosTotal += (producto.cantidad * producto.precioUnitario) || 0;
                }
            });
        });
        
        return { cantidadTotal, ingresosTotal };
    };

    // ============================================
    // CÁLCULOS DE ESTADÍSTICAS
    // ============================================
    
    const metricas = {
        totalPedidos: pedidosFiltrados.length,
        totalClientes: usuarios.length,
        productosVendidos: pedidosFiltrados.reduce((sum, p) => 
            sum + (p.productos?.reduce((s, prod) => s + (prod.cantidad || 0), 0) || 0), 0),
        ingresosTotales: pedidosFiltrados.reduce((sum, p) => sum + (p.totalFinal || 0), 0),
        pedidosPendientes: pedidosFiltrados.filter(p => p.estado === 'Pendiente').length,
        pedidosEnProceso: pedidosFiltrados.filter(p => p.estado === 'En_proceso').length,
        pedidosEntregados: pedidosFiltrados.filter(p => p.estado === 'Entregado').length,
        ticketPromedio: pedidosFiltrados.length > 0 
            ? pedidosFiltrados.reduce((sum, p) => sum + (p.totalFinal || 0), 0) / pedidosFiltrados.length 
            : 0
    };

    const topProductos = productosMasVendidos().slice(0, 5);
    const ventasDiarias = ventasPorDia();
    const estadosStats = statsPorEstado();
    const productoEspecifico = ventasProductoSeleccionado();

    // ============================================
    // RENDERIZADO
    // ============================================
    
    if (loading) {
        return (
            <div className="all">
                <MenuAdmin />
                <div className="container-fluid" id='container-admin'>
                    <div className="main-content">
                        <div className="container text-center mt-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-2">Cargando dashboard...</p>
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
                    <div className="container-fluid p-4">
                        
                        {/* TÍTULO */}
                        <div className="row mb-4">
                            <div className="col">
                                <h2 className="text-center">
                                    <i className="bi bi-bar-chart-fill me-2"></i>
                                    Dashboard Administrativo
                                </h2>
                                <p className="text-center text-muted">
                                    {pedidosFiltrados.length} pedidos en el período seleccionado
                                </p>
                            </div>
                        </div>

                        {/* FILTROS */}
                        <div className="row mb-4 g-3">
                            <div className="col-md-3">
                                <label className="form-label">Fecha inicio</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filtroFecha.inicio}
                                    onChange={(e) => setFiltroFecha({...filtroFecha, inicio: e.target.value})}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Fecha fin</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filtroFecha.fin}
                                    onChange={(e) => setFiltroFecha({...filtroFecha, fin: e.target.value})}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Estado pedido</label>
                                <select 
                                    className="form-select"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En_proceso">En proceso</option>
                                    <option value="Entregado">Entregado</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Producto</label>
                                <select 
                                    className="form-select"
                                    value={filtroProducto}
                                    onChange={(e) => setFiltroProducto(e.target.value)}
                                >
                                    <option value="todos">Todos los productos</option>
                                    {listaProductos.map((p, idx) => (
                                        <option key={idx} value={p.nombre}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* INFO DEL PRODUCTO SELECCIONADO */}
                        {filtroProducto !== 'todos' && productoEspecifico && (
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="alert alert-info">
                                        <h5 className="alert-heading">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Producto: {filtroProducto}
                                        </h5>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-6">
                                                <strong>Cantidad vendida:</strong> {productoEspecifico.cantidadTotal} unidades
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Ingresos generados:</strong> ${productoEspecifico.ingresosTotal.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TARJETAS DE MÉTRICAS */}
                        <div className="row mb-4">
                            <div className="col-md-3 mb-3">
                                <div className="card text-white bg-primary">
                                    <div className="card-body">
                                        <h6 className="card-title">Pedidos totales</h6>
                                        <h3>{metricas.totalPedidos}</h3>
                                        <small>
                                            Pend: {metricas.pedidosPendientes} | 
                                            Proc: {metricas.pedidosEnProceso} | 
                                            Ent: {metricas.pedidosEntregados}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-3 mb-3">
                                <div className="card text-white bg-success">
                                    <div className="card-body">
                                        <h6 className="card-title">Clientes</h6>
                                        <h3>{metricas.totalClientes}</h3>
                                        <small>Usuarios registrados</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-3 mb-3">
                                <div className="card text-white bg-info">
                                    <div className="card-body">
                                        <h6 className="card-title">Productos vendidos</h6>
                                        <h3>{metricas.productosVendidos}</h3>
                                        <small>Unidades totales</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-3 mb-3">
                                <div className="card text-white bg-warning">
                                    <div className="card-body">
                                        <h6 className="card-title">Ingresos totales</h6>
                                        <h3>${metricas.ingresosTotales.toLocaleString()}</h3>
                                        <small>Ticket prom: ${metricas.ticketPromedio.toLocaleString()}</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VENTAS DIARIAS */}
                        <div className="row mb-4">
                            <div className="col-md-8">
                                <div className="card">
                                    <div className="card-header bg-dark text-white">
                                        <h5 className="mb-0">Ventas diarias</h5>
                                    </div>
                                    <div className="card-body">
                                        {ventasDiarias.length > 0 ? (
                                            <div className="table-responsive" style={{ maxHeight: '300px' }}>
                                                <table className="table table-sm table-bordered">
                                                    <thead className="table-light sticky-top">
                                                        <tr>
                                                            <th>Fecha</th>
                                                            <th>Pedidos</th>
                                                            <th>Productos</th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ventasDiarias.map((dia, idx) => (
                                                            <tr key={idx}>
                                                                <td>{dia.fecha}</td>
                                                                <td>{dia.pedidos}</td>
                                                                <td>{dia.cantidad}</td>
                                                                <td>${dia.total.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted my-3">
                                                No hay ventas en el período seleccionado
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-header bg-dark text-white">
                                        <h5 className="mb-0">Estados de pedidos</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="list-group">
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                Pendientes
                                                <span className="badge bg-warning rounded-pill">
                                                    {estadosStats.Pendiente}
                                                </span>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                En proceso
                                                <span className="badge bg-info rounded-pill">
                                                    {estadosStats.En_proceso}
                                                </span>
                                            </div>
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                Entregados
                                                <span className="badge bg-success rounded-pill">
                                                    {estadosStats.Entregado}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PRODUCTOS MÁS VENDIDOS */}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header bg-dark text-white">
                                        <h5 className="mb-0">Top 5 productos más vendidos</h5>
                                    </div>
                                    <div className="card-body">
                                        {topProductos.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Producto</th>
                                                            <th>Cantidad</th>
                                                            <th>Veces</th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {topProductos.map((prod, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    <strong>{prod.nombre || prod.codigo}</strong>
                                                                </td>
                                                                <td>{prod.cantidad}</td>
                                                                <td>{prod.vecesVendido}</td>
                                                                <td>${prod.total.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted my-3">
                                                No hay productos vendidos
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header bg-dark text-white">
                                        <h5 className="mb-0">Últimos 5 pedidos</h5>
                                    </div>
                                    <div className="card-body">
                                        {pedidosFiltrados.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Cliente</th>
                                                            <th>Estado</th>
                                                            <th>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pedidosFiltrados.slice(-5).reverse().map(p => (
                                                            <tr key={p.idPedido}>
                                                                <td>#{p.idPedido}</td>
                                                                <td>{p.nombreUsuario}</td>
                                                                <td>
                                                                    <span className={`badge ${
                                                                        p.estado === 'Entregado' ? 'bg-success' :
                                                                        p.estado === 'En_proceso' ? 'bg-info' :
                                                                        'bg-warning'
                                                                    }`}>
                                                                        {p.estado}
                                                                    </span>
                                                                </td>
                                                                <td>${p.totalFinal?.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted my-3">
                                                No hay pedidos recientes
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LISTA DE CLIENTES */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header bg-dark text-white">
                                        <h5 className="mb-0">Clientes registrados</h5>
                                    </div>
                                    <div className="card-body">
                                        {usuarios.length > 0 ? (
                                            <div className="table-responsive" style={{ maxHeight: '300px' }}>
                                                <table className="table table-sm">
                                                    <thead className="table-light sticky-top">
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Nombre</th>
                                                            <th>Email</th>
                                                            <th>Documento</th>
                                                            <th>Teléfono</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {usuarios.map(u => (
                                                            <tr key={u.idUsuario}>
                                                                <td>{u.idUsuario}</td>
                                                                <td>{u.nombreUsuario} {u.primerApellido}</td>
                                                                <td>{u.correoElectronico}</td>
                                                                <td>{u.numeroDocumento}</td>
                                                                <td>{u.telefono}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center text-muted my-3">
                                                No hay clientes registrados
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;