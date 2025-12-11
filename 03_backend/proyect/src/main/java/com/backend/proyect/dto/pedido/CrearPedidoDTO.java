
    package com.backend.proyect.dto.pedido;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CrearPedidoDTO {
    private Integer idUsuario;
    private Integer idCarrito;
    private Integer idPromocion;
    private Integer idMetodoPago;
    private LocalDate fechaPedido;
    // ... otros campos necesarios
}
