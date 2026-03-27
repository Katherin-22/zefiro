package com.backend.proyect.model.pedido;

import com.backend.proyect.model.productos.Stock;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "DetallePedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idDetallePedido")
    private Integer idDetallePedido;

    @ManyToOne
    @JoinColumn(name = "idPedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "idStock", nullable = false)
    private Stock stock;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precioUnitario", nullable = false)
    private Double precioUnitario;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @PrePersist
    public void calcularSubtotal() {
        if (precioUnitario != null && cantidad != null) {
            this.subtotal = BigDecimal.valueOf(precioUnitario * cantidad)
                    .setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }
}