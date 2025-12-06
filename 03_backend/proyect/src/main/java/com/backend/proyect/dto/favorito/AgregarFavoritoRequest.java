package com.backend.proyect.dto.favorito;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgregarFavoritoRequest {
    private Integer idProducto;
}