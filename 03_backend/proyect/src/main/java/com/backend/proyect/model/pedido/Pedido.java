package com.backend.proyect.model.pedido;

import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.metodosPago.MetodoPago;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Pedido")

public class  Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPedido")
    private Integer idPedido;

    @Column(name = "fechaPedido", nullable = false)
    private LocalDate fechaPedido;


    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @OneToOne
    @JoinColumn(name = "idCarrito", nullable = false)
    private Carrito carrito;

    @ManyToOne
    @JoinColumn(name = "idPromocion")
    private Promocion promocion;

    @ManyToOne
    @JoinColumn(name = "idMetodoPago", nullable = false)
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estadoPedido", columnDefinition = "ENUM('Pendiente','Procesando','Entregado')")
    private EstadoPedido estadoPedido;

    @Column(name = "total_final", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFinal;

    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) {
            fechaPedido = LocalDate.now();
        }
        if (estadoPedido == null) {
            estadoPedido = EstadoPedido.Pendiente;
        }
        if (totalFinal == null) {
            totalFinal = BigDecimal.ZERO;
        }
    }

}