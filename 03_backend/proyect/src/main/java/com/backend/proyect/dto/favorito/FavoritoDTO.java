package com.backend.proyect.dto.favorito;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoDTO {
    private Integer idFavorito;
    private Integer idUsuario;
    private Integer idProducto;
    private LocalDateTime fechaAgregado;
    private String nombreProducto;
    private Double precioProducto;
    private String imagenUrl; // URL de la primera imagen del producto
}