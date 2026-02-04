package com.backend.proyect.model.pedido;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.metodoPagos.MetodoPago;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.usuario.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @ManyToOne
    @JoinColumn(name = "idEstadoPedido", nullable = false)
    private EstadoPedido estadoPedido;

    @Column(name = "total_final", nullable = false)
    private BigDecimal totalFinal;

    
    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) fechaPedido = LocalDate.now();
    }

}