package com.backend.proyect.model.pedido;

import com.backend.proyect.model.productos.Stock;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

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

    @ManyToOne(optional = false)
    @JoinColumn(name = "idPedido", referencedColumnName = "idPedido")
    @JsonBackReference // 1. Evita el bucle infinito en la serialización JSON
    @ToString.Exclude
    private Pedido pedido;

    @ManyToOne(optional = false)
    @JoinColumn(name = "idStock", referencedColumnName = "idStock")
    private Stock stock;
}




