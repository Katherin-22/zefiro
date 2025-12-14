package com.backend.proyect.model.metodoPagos;

import com.backend.proyect.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "RespuestaPago")

public class RespuestaPago {
    @Id
    @Column(name = "id", length = 255, nullable = false)
    private String id;

    @Column(name = "clientSecret", nullable = false, length = 200)
    private String clientSecret;        

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;    

    @Column(name = "status", nullable = false, length = 200)
    private String status;

    // Relación muchos a uno con Categoria
     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "idUsuario", nullable = false)
     @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
     private Usuario usuario;    

}
