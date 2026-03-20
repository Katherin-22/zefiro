package com.backend.proyect.model.usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "estado_usuario")

public class EstadoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idestado_usuario")
    private Integer  idestado_usuario;

    @Column(name = "nombre_Estado_usuario")
    private String nombre_Estado_usuario;


    // Getters and setters
}
