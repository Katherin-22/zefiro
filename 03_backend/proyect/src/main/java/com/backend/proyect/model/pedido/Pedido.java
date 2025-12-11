package com.backend.proyect.model.pedido;

import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.metodosPago.MetodoPago;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "Pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPedido;
    
    private LocalDate fechaPedido;
    
    @ManyToOne
    @JoinColumn(name = "idUsuario")
    private Usuario usuario;
    
    @OneToOne
    @JoinColumn(name = "idCarrito")
    private Carrito carrito;
    
    @ManyToOne
    @JoinColumn(name = "idPromocion")
    private Promocion promocion;
    
    @ManyToOne
    @JoinColumn(name = "idMetodoPago")
    private MetodoPago metodoPago;
    
    private String estado;
    
    @PrePersist
    public void prePersist() {
        if (fechaPedido == null) fechaPedido = LocalDate.now();
        if (estado == null) estado = "PENDIENTE";
    }

    @Column(name = "total")
    private Integer total;
}