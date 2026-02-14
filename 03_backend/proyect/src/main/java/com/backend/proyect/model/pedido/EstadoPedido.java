package com.backend.proyect.model.pedido;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "EstadoPedido")

public class EstadoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idEstadoPedido")
    private Integer idEstadoPedido;

    @Column(name = "nombreEstado", nullable = false)
    private String nombreEstado;

}


