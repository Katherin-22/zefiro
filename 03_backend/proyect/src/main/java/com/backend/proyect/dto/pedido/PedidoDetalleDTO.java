package com.backend.proyect.dto.pedido;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class PedidoDetalleDTO {
    // Datos del pedido
    private Long idPedido;
    private LocalDate fechaPedido;
    private String estado;

    // Datos del usuario (de la tabla Usuario)
    private String nombreUsuario;
    private String primerApellido;
    private String segundoApellido;
    private String numeroDocumento;
    private String telefono;
    private String Direccion;           // Respeta el nombre de la BD (con mayúscula)
    private String correoElectronico;

    // Datos del tipo de documento
    private String nombreTipoDeDocumento;

    // Datos del producto (de la tabla Producto)
    private String codigoReferencia;
    private String nombreProducto;

    // Datos del color (de la tabla Color)
    private String nombreColor;

    // Datos de la variación (de la tabla Variacion)
    private String nombre;              // Así se llama en la tabla Variacion

    // Datos del detalle del carrito/pedido
    private Integer cantidad;
    private BigDecimal precioUnitario;

    // Datos de promoción
    private String nombrePromocion;
    private BigDecimal descuento;
}