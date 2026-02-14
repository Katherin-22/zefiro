package com.backend.proyect.dto.carrito;

import jakarta.validation.constraints.Min;
import lombok.Data; // Importa Lombok

@Data
public class CantidadDTO {

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;
}
