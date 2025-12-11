package com.backend.proyect.model.metodosPago;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


    @Entity
    @Table(name = "MetodoPago")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class MetodoPago {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer idMetodoPago;

        @Column(name = "nombreMetodoPago")
        private String nombreMetodoPago;

    }

