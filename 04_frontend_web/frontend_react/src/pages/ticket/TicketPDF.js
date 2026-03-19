import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
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
        textAlign: 'center',
        color: '#E0B253',
        marginBottom: 5,
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
        marginBottom: 10
    },
    section: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9'
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 3
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4
    },
    label: {
        width: '25%',
        fontSize: 10,
        color: '#666'
    },
    value: {
        width: '75%',
        fontSize: 10,
        fontWeight: 'bold'
    },
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E0B253',
        padding: 5,
        color: 'white',
        fontWeight: 'bold'
    },
    tableRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        padding: 5
    },
    col1: { width: '25%', fontSize: 9 },
    col2: { width: '15%', fontSize: 9 },
    col3: { width: '15%', fontSize: 9 },
    col4: { width: '15%', fontSize: 9, textAlign: 'center' },
    col5: { width: '15%', fontSize: 9, textAlign: 'right' },
    col6: { width: '15%', fontSize: 9, textAlign: 'right' },
    total: {
        marginTop: 15,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E0B253',
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#E0B253'
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        fontSize: 9,
        color: '#999',
        fontStyle: 'italic'
    },
    headerText: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2
    }
});

const TicketPDF = ({ pedido, formData, formatearCOP, formatearFecha }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>ZÉFIRO</Text>
                <Text style={styles.subtitle}>Ticket de Compra #{pedido?.idPedido}</Text>
                <Text style={styles.headerText}>Fecha de emisión: {new Date().toLocaleDateString('es-ES')}</Text>
            </View>

            {/* Datos del Cliente */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos del Cliente</Text>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Cliente:</Text>
                    <Text style={styles.value}>
                        {formData?.nombreUsuario || formData?.nombre} {formData?.primerApellido || ''} {formData?.segundoApellido || ''}
                    </Text>
                </View>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Teléfono:</Text>
                    <Text style={styles.value}>{formData?.telefono}</Text>
                </View>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{formData?.correoElectronico}</Text>
                </View>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Dirección:</Text>
                    <Text style={styles.value}>{formData?.Direccion}</Text>
                </View>
            </View>

            {/* Datos del Pedido */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
                
                <View style={styles.row}>
                    <Text style={styles.label}>Fecha:</Text>
                    <Text style={styles.value}>{formatearFecha(pedido?.fechaPedido)}</Text>
                </View>
                

            </View>

            {/* Tabla de Productos */}
            <View style={styles.table}>
                {/* Header de la tabla */}
                <View style={styles.tableHeader}>
                    <Text style={styles.col1}>Producto</Text>
                    <Text style={styles.col2}>Color</Text>
                    <Text style={styles.col3}>Talla</Text>
                    <Text style={styles.col4}>Cant.</Text>
                    <Text style={styles.col5}>Precio</Text>
                    <Text style={styles.col6}>Subtotal</Text>
                </View>

                {/* Filas de productos */}
                {pedido?.productos?.map((prod, idx) => (
                    <View style={styles.tableRow} key={idx}>
                        <Text style={styles.col1}>
                            {prod.nombreProducto}
                            {prod.codigoReferencia ? `\nRef: ${prod.codigoReferencia}` : ''}
                        </Text>
                        <Text style={styles.col2}>{prod.nombreColor}</Text>
                        <Text style={styles.col3}>{prod.nombreVariacion}</Text>
                        <Text style={styles.col4}>{prod.cantidad}</Text>
                        <Text style={styles.col5}>{formatearCOP(prod.precioUnitario)}</Text>
                        <Text style={styles.col6}>{formatearCOP(prod.cantidad * prod.precioUnitario)}</Text>
                    </View>
                ))}
            </View>

            {/* Total */}
            <Text style={styles.total}>
                Total: {formatearCOP(pedido?.totalFinal)}
            </Text>

            {/* Footer */}
            <Text style={styles.footer}>
                ¡Gracias por tu compra! Este ticket es el comprobante de tu pedido.
                Para cualquier consulta, contáctanos a servicioalcliente@zefiro.com
            </Text>
        </Page>
    </Document>
);

export default TicketPDF;