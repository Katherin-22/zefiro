// src/components/administrador/PdfDashboard.jsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helvetica/v23/9BWp3s6qIh5zKm5l.woff2' }
    ]
});

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#E0B253',
        paddingBottom: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E0B253',
        textAlign: 'center',
        marginBottom: 5
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5
    },
    fechaInfo: {
        fontSize: 10,
        color: '#888',
        textAlign: 'center'
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E0B253',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 5
    },
    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15
    },
    metricCard: {
        width: '48%',
        padding: 10,
        marginBottom: 10,
        marginHorizontal: '1%',
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        borderWidth: 1,
        flex: 2,
        borderColor: '#dee2e6'
    },
    metricLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 3
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E0B253'
    },
    metricSmall: {
        fontSize: 8,
        color: '#888',
        marginTop: 2
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 5
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E0B253',
        padding: 8,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    tableHeaderCell: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        flex: 1
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        backgroundColor: 'white'
    },
    tableRowEven: {
        backgroundColor: '#f8f9fa'
    },
    tableCell: {
        fontSize: 9,
        color: '#333',
        flex: 1
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 8,
        alignSelf: 'flex-start'
    },
    badgePendiente: {
        backgroundColor: '#fff3cd',
        color: '#856404'
    },
    badgeProceso: {
        backgroundColor: '#cfe2ff',
        color: '#052c65'
    },
    badgeEntregado: {
        backgroundColor: '#d1e7dd',
        color: '#0a3622'
    },
    summaryBox: {
        backgroundColor: '#e7f5ff',
        padding: 10,
        borderRadius: 5,
        marginTop: 15
    },
    summaryText: {
        fontSize: 10,
        color: '#333',
        marginBottom: 3
    },
    summaryBold: {
        fontWeight: 'bold',
        color: '#E0B253'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#888',
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        paddingTop: 10
    },
    twoColumns: {
        flexDirection: 'row',
        marginBottom: 15
    },
    column: {
        flex: 2,
        paddingHorizontal: 6
    },
    filterInfo: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 9,
        color: '#666'
    }
});

// Función para formatear moneda
const formatearCOP = (valor) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor || 0);
};

// Función para formatear fecha
const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Componente principal del PDF
const PdfDashboard = ({ 
    pedidos = [], 
    productos = [], 
    usuarios = [], 
    metricas = {}, 
    filtros = {}, 
    topProductos = [],
    ventasDiarias = [],
    estadoPedidoStats = {}
}) => {
    
    // Obtener nombre del estado para badge
    const getEstadoBadge = (estadoPedido) => {
        switch(estadoPedido) {
            case 'Pendiente': return styles.badgePendiente;
            case 'En_proceso': return styles.badgeProceso;
            case 'Entregado': return styles.badgeEntregado;
            default: return {};
        }
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard Administrativo</Text>
                    <Text style={styles.subtitle}>estadísticas</Text>
                    <Text style={styles.fechaInfo}>
                        Generado: {formatearFecha(new Date())}
                    </Text>
                </View>

                {/* FILTROS APLICADOS */}
                {filtros && (
                    <View style={styles.filterInfo}>
                        <Text>Filtros aplicados:</Text>
                        <Text>• Fechas: {formatearFecha(filtros.fechaInicio)} - {formatearFecha(filtros.fechaFin)}</Text>
                        {filtros.estadoPedido && filtros.estadoPedido!== 'todos' && (
                            <Text>• Estado: {filtros.estadoPedido}</Text>
                        )}
                        {filtros.producto && filtros.producto !== 'todos' && (
                            <Text>• Producto: {filtros.producto}</Text>
                        )}
                    </View>
                )}

                {/* MÉTRICAS PRINCIPALES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Métricas Generales</Text>
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Total Pedidos</Text>
                            <Text style={styles.metricValue}>{metricas.totalPedidos || 0}</Text>
                            <Text style={styles.metricSmall}>
                                Pend: {metricas.pedidosPendientes || 0} | 
                                Proc: {metricas.pedidosEnProceso || 0} | 
                                Ent: {metricas.pedidosEntregados || 0}
                            </Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Clientes</Text>
                            <Text style={styles.metricValue}>{metricas.totalClientes || 0}</Text>
                            <Text style={styles.metricSmall}>Usuarios registrados</Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Productos Vendidos</Text>
                            <Text style={styles.metricValue}>{metricas.productosVendidos || 0}</Text>
                            <Text style={styles.metricSmall}>Unidades totales</Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Ingresos Totales</Text>
                            <Text style={styles.metricValue}>{formatearCOP(metricas.ingresosTotales)}</Text>
                            <Text style={styles.metricSmall}>Ticket prom: {formatearCOP(metricas.ticketPromedio)}</Text>
                        </View>
                    </View>
                </View>

                {/* ESTADOS DE PEDIDOS */}
                <View style={styles.twoColumns}>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Estados de Pedidos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderCell}>Estado</Text>
                                <Text style={styles.tableHeaderCell}>Cantidad</Text>
                            </View>
                            {Object.entries(estadoPedidoStats).map(([estadoPedido, cantidad], index) => (
                                <View key={estadoPedido} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                                    <Text style={[styles.tableCell, getEstadoBadge(estadoPedido)]}>{estadoPedido}</Text>
                                    <Text style={styles.tableCell}>{cantidad}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Top 5 Productos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderCell}>Producto</Text>
                                <Text style={styles.tableHeaderCell}>Cantidad</Text>
                                <Text style={styles.tableHeaderCell}>Total</Text>
                            </View>
                            {topProductos.slice(0, 5).map((prod, index) => (
                                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                                    <Text style={styles.tableCell}>{prod.nombre || prod.codigo}</Text>
                                    <Text style={styles.tableCell}>{prod.cantidad}</Text>
                                    <Text style={styles.tableCell}>{formatearCOP(prod.total)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ÚLTIMOS PEDIDOS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Últimos Pedidos</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderCell}>ID</Text>
                            <Text style={styles.tableHeaderCell}>Cliente</Text>
                            <Text style={styles.tableHeaderCell}>Estado</Text>
                            <Text style={styles.tableHeaderCell}>Total</Text>
                        </View>
                        {pedidos.slice(-5).reverse().map((pedido, index) => (
                            <View key={pedido.idPedido} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                                <Text style={styles.tableCell}>#{pedido.idPedido}</Text>
                                <Text style={styles.tableCell}>{pedido.nombreUsuario}</Text>
                                <Text style={[styles.tableCell, getEstadoBadge(pedido.estadoPedido)]}>{pedido.estadoPedido}</Text>
                                <Text style={styles.tableCell}>{formatearCOP(pedido.totalFinal)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* RESUMEN FINAL */}
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryBold}>Resumen del Período</Text>
                    <Text style={styles.summaryText}>Total de pedidos: {metricas.totalPedidos}</Text>
                    <Text style={styles.summaryText}>Total de productos vendidos: {metricas.productosVendidos}</Text>
                    <Text style={styles.summaryText}>Ingresos totales: {formatearCOP(metricas.ingresosTotales)}</Text>
                    <Text style={styles.summaryText}>Ticket promedio: {formatearCOP(metricas.ticketPromedio)}</Text>
                </View>

                {/* FOOTER */}
                <View style={styles.footer}>
                    <Text>Dashboard Administrativo </Text>
                    <Text>Página 1 de 1</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PdfDashboard;