package com.backend.proyect.dto.carrito;

import jakarta.validation.constraints.Min;

import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data

public class AgregarItemDTO {

    @NotNull(message = "El ID de la variación (Stock) es obligatorio")

    private Integer idStock;



    @Min(value = 1, message = "La cantidad debe ser al menos 1")

    private Integer cantidad;
}

