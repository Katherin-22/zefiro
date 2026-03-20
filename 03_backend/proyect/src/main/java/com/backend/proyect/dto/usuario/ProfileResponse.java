package com.backend.proyect.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder


public class ProfileResponse {

    private Integer idUsuario;

    private String nombreUsuario;

    private String correoElectronico;

    private Boolean isAccountVerified;

}
