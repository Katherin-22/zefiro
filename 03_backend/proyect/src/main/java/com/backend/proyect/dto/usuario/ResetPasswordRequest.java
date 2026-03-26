package com.backend.proyect.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data

public class ResetPasswordRequest {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String correoElectronico;

    @NotBlank(message = "El OTP es obligatorio")
    private String otp;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 8, max = 20, message = "La contraseña debe tener entre 8 y 20 caracteres")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.]).*$",
            message = "Debe incluir mayúsculas, minúsculas, números y símbolos")
    private String newPassword;

}
