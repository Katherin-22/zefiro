package com.backend.proyect.model.pedido;

import com.backend.proyect.model.productos.Stock;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "DetallePedido")
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idDetallePedido")
    private Integer idDetallePedido;

    @NotNull
    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precioUnitario", nullable = false)
    private Double precioUnitario;

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal;

    @ManyToOne
    @JoinColumn(name = "idPedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "idStock", nullable = false)
    private Stock stock;

    @PrePersist
    public void calcularSubtotal() {
        if (precioUnitario != null && cantidad != null) {
            this.subtotal = BigDecimal.valueOf(precioUnitario * cantidad)
                    .setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }

}




