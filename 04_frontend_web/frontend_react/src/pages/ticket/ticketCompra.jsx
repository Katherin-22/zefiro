import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import api_url from '../../services/administrador/api';
import useAuth from '../../hooks/token/useAuth';
import MenuHome from '../../layouts/home/menuHome';
import Footer from '../../layouts/home/footer';

function TicketCompra() {
    const { idPedido } = useParams(); // Recibe el ID del pedido desde la URL
    const navigate = useNavigate();
    const { token } = useAuth();
    const [pedido, setPedido] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPedido = async () => {
            try {
                setLoading(true);

                // 1️⃣ Obtener datos del pedido
                const pedidoRes = await api_url.get(`/api/pedidos/${idPedido}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPedido(pedidoRes.data);

                // 2️⃣ Obtener detalles del pedido (productos comprados)
                const detallesRes = await api_url.get(`/api/pedidos/${idPedido}/detalles`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 3️⃣ Mapear los detalles para extraer la información del stock
                const detallesConProductos = detallesRes.data.map(detalle => {
                    // Extraer datos del stock anidado
                    const stock = detalle.stock || {};
                    const producto = stock.producto || {};
                    const color = stock.color || {};
                    const variacion = stock.variacion || {};

                    return {
                        idDetalle: detalle.idDetallePedido,
                        cantidad: detalle.cantidad,
                        precioUnitario: detalle.precioUnitario,
                        subtotal: detalle.subtotal,
                        // Datos del producto
                        nombreProducto: producto.nombreProducto || 'Producto',
                        // Datos del stock (color y talla)
                        color: color.nombreColor || 'No especificado',
                        talla: variacion.nombre || 'No especificado',
                        // Imagen (si la hay)
                        imagen: producto.imagen || null
                    };
                });

                setDetalles(detallesConProductos);
                setError(null);
            } catch (err) {
                console.error("Error cargando pedido:", err);
                setError("No se pudo cargar el ticket de compra");
            } finally {
                setLoading(false);
            }
        };

        if (idPedido && token) {
            fetchPedido();
        }
    }, [idPedido, token]);

    // Función para formatear moneda
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="allHome">
                <MenuHome />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Cargando ticket...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !pedido) {
        return (
            <div className="allHome">
                <MenuHome />
                <div className="container text-center py-5">
                    <div className="alert alert-danger">
                        {error || 'No se encontró el pedido'}
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/mis-pedidos')}
                        style={{ backgroundColor: '#E0B253', borderColor: '#E0B253' }}
                    >
                        Ver mis pedidos
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="allHome">
            <MenuHome />
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">
                        {/* Ticket de compra */}
                        <div className="bg-white rounded shadow-lg p-4">
                            {/* Encabezado del ticket */}
                            <div className="text-center mb-4">
                                <h1 className="display-6" style={{ color: '#E0B253' }}>
                                    🧾 FACTURA DE COMPRA
                                </h1>
                                <div className="border-top border-2 my-3" style={{ borderColor: '#E0B253' }}></div>
                            </div>

                            {/* Información del pedido */}
                            <div className="mb-4">
                                <div className="row">
                                    <div className="col-6">
                                        <p><strong>Factura N°:</strong> #{pedido.idPedido}</p>
                                        <p><strong>Fecha:</strong> {formatDate(pedido.fechaPedido)}</p>
                                    </div>
                                    <div className="col-6 text-end">
                                        <p><strong>Estado:</strong>
                                            <span className="badge bg-success ms-2">{pedido.estado}</span>
                                        </p>
                                        <p><strong>Método de pago:</strong> PSE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalle de productos */}
                            <div className="mb-4">
                                <h4 className="mb-3">Productos comprados</h4>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Producto</th>
                                                <th>Color/Talla</th>
                                                <th className="text-center">Cant.</th>
                                                <th className="text-end">Precio Unit.</th>
                                                <th className="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalles.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.nombreProducto}</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark me-1">
                                                            🎨 {item.color}
                                                        </span>
                                                        <span className="badge bg-light text-dark">
                                                            📏 {item.talla}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">{item.cantidad}</td>
                                                    <td className="text-end">{formatMoney(item.precioUnitario)}</td>
                                                    <td className="text-end fw-bold">{formatMoney(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan="4" className="text-end fw-bold">TOTAL:</td>
                                                <td className="text-end fw-bold" style={{ color: '#E0B253', fontSize: '1.2rem' }}>
                                                    {formatMoney(pedido.totalFinal)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="row mt-4">
                                <div className="col-md-6">
                                    <div className="border rounded p-3">
                                        <h5>📦 Información de envío</h5>
                                        <p className="mb-1"><strong>Dirección:</strong> {pedido.direccionEnvio || 'No especificada'}</p>
                                        <p className="mb-0"><strong>Ciudad:</strong> {pedido.ciudad || 'Bogotá'}</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="border rounded p-3">
                                        <h5>💳 Información de pago</h5>
                                        <p className="mb-1"><strong>Método:</strong> PSE</p>
                                        <p className="mb-0"><strong>Estado:</strong> Pagado</p>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate('/mis-pedidos')}
                                >
                                    ← Volver a pedidos
                                </Button>
                                <div>
                                    <Button
                                        variant="success"
                                        className="me-2"
                                        onClick={() => window.print()}
                                    >
                                        🖨️ Imprimir
                                    </Button>
                                    <Button
                                        style={{ backgroundColor: '#E0B253', borderColor: '#E0B253' }}
                                        onClick={() => navigate('/catalogo')}
                                    >
                                        🛍️ Seguir comprando
                                    </Button>
                                </div>
                            </div>

                            {/* Pie de página del ticket */}
                            <div className="text-center mt-4 pt-3 border-top">
                                <p className="text-muted small mb-0">
                                    ¡Gracias por tu compra! | Innovation Fusion
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default TicketCompra;