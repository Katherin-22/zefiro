package com.backend.proyect.model.metodoPagos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "MetodoPago")

public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMetodoPago")
    private Integer idMetodoPago;

    @Column(name = "nombreMetodoPago")
    private String nombreMetodoPago;

}

