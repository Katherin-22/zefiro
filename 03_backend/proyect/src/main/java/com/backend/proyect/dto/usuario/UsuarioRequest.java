package com.backend.proyect.dto.usuario;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class UsuarioRequest {

    @NotNull(message = "El documento no puede ser nulo")
    private Integer numeroDocumento;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombreUsuario;

    @NotBlank(message = "El apellido es obligatorio")
    private String primerApellido;

    private String segundoApellido;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe tener 10 dígitos numéricos")
    private String telefono;

    @NotBlank(groups = ValidationGroups.OnCreate.class, message = "La contraseña es obligatoria al registrarse")
    @Size(min = 8, max = 20, message = "La contraseña debe tener entre 8 y 20 caracteres")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.]).*$",
            message = "Debe incluir mayúsculas, minúsculas, números y símbolos")
    private String password;

    @Email(message = "Formato de correo inválido")
    @NotBlank(message = "El correo es obligatorio")
    private String correoElectronico;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    @NotNull(message = "El rol es obligatorio")
    private Integer idRol;

    @NotNull(message = "El tipo de documento es obligatorio")
    private Integer idTipoDeDocumento;

    @NotNull(message = "El estado de usuario es obligatorio")
    private Integer idEstadoUsuario;

}