package com.backend.proyect.model.pedido;

import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.metodosPago.MetodoPago;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
    @JsonIgnore
    @ToString.Exclude
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

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference // Indica que esta es la parte de la relación que sí se debe serializar
    private List<DetallePedido> detalles;

    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) fechaPedido = LocalDate.now();
    }

}