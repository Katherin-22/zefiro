package com.backend.proyect.model.metodoPagos;

import com.backend.proyect.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "idUsuario", nullable = false)
     @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
     private Usuario usuario;        

}