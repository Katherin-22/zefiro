package com.backend.proyect.model.pedido;

import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.metodoPagos.MetodoPago;
import com.backend.proyect.model.carrito.Carrito;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPedido")
    private Integer idPedido;

    @Column(name = "fechaPedido", nullable = false)
    private LocalDate fechaPedido;

    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idCarrito", nullable = false)
    private Carrito carrito;

    @ManyToOne
    @JoinColumn(name = "idPromocion")
    private Promocion promocion;

    @ManyToOne
    @JoinColumn(name = "idMetodoPago", nullable = false)
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", columnDefinition = "ENUM('Pendiente','En proceso','Entregado')")
    private EstadoPedido estado;

    @Column(name = "total_final", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFinal;

    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) {
            fechaPedido = LocalDate.now();
        }
        if (estado == null) {
            estado = EstadoPedido.Pendiente;
        }
        if (totalFinal == null) {
            totalFinal = BigDecimal.ZERO;
        }
    }
}