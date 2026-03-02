package com.backend.proyect.dto.pedido;

import java.math.BigDecimal;
import java.time.LocalDate;

// sirve para no hacer getter y setter
import lombok.Data;

@Data
public class PedidoDetalleDTO {
    private Long idPedido;
    private LocalDate fechaPedido;
    private String nombreUsuario;
    private String codigoReferencia;
    private String nombreProducto;
    private String nombreColor;
    private String nombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private String nombrePromocion;
    private BigDecimal descuento;
    
}