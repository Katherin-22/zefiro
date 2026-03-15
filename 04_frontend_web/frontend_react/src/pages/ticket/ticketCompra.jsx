import React, { useState, useEffect } from 'react';
import { buscarPedidoPorId } from "../../services/administrador/pedidos";
import { useNavigate, useParams } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import api_url from '../../services/administrador/api';
import MenuHome from '../../layouts/home/menuHome';
import useAuth from '../../hooks/token/useAuth';
import TicketPDF from './TicketPDF';

const TicketCompra = () => {
    const { userData, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { idPedido } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(null);
    const [showPDF, setShowPDF] = useState(false);

    const userId = userData?.id || userData?.idUsuario || null;

    const formatearCOP = (precio) => {
        if (!precio && precio !== 0) return '$0';
        const valor = Math.round(Number(precio));
        return '$' + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // 📌 FUNCIÓN PARA PROCESAR UN PEDIDO
    const procesarPedido = (item) => {
        console.log("📦 Procesando pedido:", item);
        
        // Verificar si item tiene la estructura esperada
        if (!item) return null;
        
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
        
        return {
            idPedido: item.idPedido,
            fechaPedido: item.fechaPedido,
            nombreUsuario: item.usuario?.nombreUsuario || 'Usuario',
            estado: item.estado || 'Pendiente',
            totalFinal: productos.reduce(
                (total, prod) => total + (prod.cantidad * prod.precioUnitario), 0
            ),
            productos: productos
        };
    };

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

                console.log("📥 Perfil cargado:", response.data);
                setFormData(response.data);
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
            }
        };

        fetchUserProfile();
    }, [userId]);

useEffect(() => {
    const fetchPedido = async () => {
        if (!idPedido) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("🔄 Cargando pedido ID:", idPedido);
            
            const response = await buscarPedidoPorId(idPedido);
            
            console.log("📦 Respuesta completa:", response);
            console.log("📦 response.data:", response.data);
            
            if (response?.data) {
                const datosPedido = Array.isArray(response.data) ? response.data[0] : response.data;
                
                console.log("🔍 Datos a procesar:", datosPedido);
                
                if (datosPedido) {
                    const pedidoProcesado = procesarPedido(datosPedido);
                    console.log("✅ Pedido procesado:", pedidoProcesado);
                    setPedido(pedidoProcesado);
                } else {
                    setPedido(null);
                }
            } else {
                console.log("⚠️ No hay datos en la respuesta");
                setPedido(null);
            }
            
        } catch (error) {
            console.error("❌ Error al cargar pedido:", error);
            if (error.response?.status === 404) {
                setPedido(null);
                setError("Pedido no encontrado");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    fetchPedido();
}, [idPedido]);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        try {
            const fechaObj = new Date(fecha);
            if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
            return fechaObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
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
                                <p>Debes iniciar sesión para ver el ticket.</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/loginpage')}
                                >
                                    Iniciar sesión
                                </button>
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
                            <p className="mt-2">Cargando ticket de compra...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !pedido) {
        return (
            <div className="all">
                <MenuHome />
                <div className="container-fluid" id='container-admin'>
                    <div className="main-content">
                        <div className="container">
                            <div className="alert alert-danger" role="alert">
                                {error || "No se encontró el pedido"}
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/pedidos')}
                            >
                                Volver a mis pedidos
                            </button>
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
                            <h2 className="text-center mb-4">Ticket de Compra #{pedido.idPedido}</h2>
                        </div>

                        {/* Botones para PDF */}
                        <div className="row mb-4">
                            <div className="col text-center">
                                <button 
                                    className="btn btn-primary me-2"
                                    onClick={() => setShowPDF(!showPDF)}
                                >
                                    {showPDF ? 'Ocultar Vista Previa' : 'Ver Vista Previa PDF'}
                                </button>
                                
                                <PDFDownloadLink 
                                    document={
                                        <TicketPDF 
                                            pedido={pedido} 
                                            formData={formData} 
                                            formatearCOP={formatearCOP} 
                                            formatearFecha={formatearFecha} 
                                        />
                                    }
                                    fileName={`ticket-${idPedido}.pdf`}
                                    className="btn btn-success"
                                >
                                    {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
                                </PDFDownloadLink>
                            </div>
                        </div>

                        {/* Vista previa del PDF */}
                        {showPDF && (
                            <div className='row mb-4'>
                                <div className='col-12'>
                                    <PDFViewer style={{ width: '100%', height: '600px' }}>
                                        <TicketPDF 
                                            pedido={pedido} 
                                            formData={formData} 
                                            formatearCOP={formatearCOP} 
                                            formatearFecha={formatearFecha} 
                                        />
                                    </PDFViewer>
                                </div>
                            </div>
                        )}

                        {/* Datos del cliente */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <p><strong>Cliente:</strong> {formData?.nombreUsuario || formData?.nombre} {formData?.primerApellido || ''} {formData?.segundoApellido || ''}</p>
                            </div>
                            <div className="col-md-3">
                                <p><strong>Teléfono:</strong> {formData?.telefono}</p>
                            </div>
                            <div className="col-md-3">
                                <p><strong>Email:</strong> {formData?.correoElectronico}</p>
                            </div>
                            <div className="col-md-3">
                                <p><strong>Dirección:</strong> {formData?.Direccion}</p>
                            </div>
                        </div>

                        {/* Detalles del pedido */}
                        <div className="row">
                            <div className="col">
                                <div className="card mb-4">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0">Detalles del Pedido</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <p><strong>Fecha:</strong> {formatearFecha(pedido.fechaPedido)}</p>
                                            </div>
                                         
                                            <div className="col-md-4">
                                                <p><strong>Total:</strong> <span className="text-success fw-bold">{formatearCOP(pedido.totalFinal)}</span></p>
                                            </div>
                                        </div>

                                        <h6 className="mb-3">Productos:</h6>
                                        <table className="table table-bordered">
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
                                                            <td className="text-end">{formatearCOP(precio)}</td>
                                                            <td className="text-end fw-bold">{formatearCOP(subtotal)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td colSpan="5" className="text-end fw-bold">Total del pedido:</td>
                                                    <td className="text-end fw-bold text-success">
                                                        {formatearCOP(pedido.totalFinal)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="text-center mt-3">
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/pedidos')}
                                    >
                                        Volver a mis pedidos
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

export default TicketCompra;