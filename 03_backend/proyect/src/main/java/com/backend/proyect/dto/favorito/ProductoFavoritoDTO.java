package com.backend.proyect.dto.favorito;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoFavoritoDTO {
    private Integer idProducto;
    private String nombreProducto;
    private String descripcion;
    private Double precio;
    private String categoria;
    private String marca;
    private List<String> imagenes;
    private Boolean enStock;
}