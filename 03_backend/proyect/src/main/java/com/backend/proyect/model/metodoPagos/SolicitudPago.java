package com.backend.proyect.model.metodoPagos;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "SolicitudPago")

public class SolicitudPago{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idSolicitudPago")
    private Integer idSolicitudPago;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "description", length = 200)
    private String description;

}