// ComentarioRequestDTO.java
package com.backend.proyect.dto.comentario;

import jakarta.validation.constraints.*;

public class ComentarioRequestDTO {
    
    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;
    
    @NotBlank(message = "El comentario no puede estar vacío")
    @Size(min = 10, max = 500, message = "El comentario debe tener entre 10 y 500 caracteres")
    private String comentario;
    
    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;
    
    // Getters y Setters
    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }
    
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    
    public Integer getCalificacion() { return calificacion; }
    public void setCalificacion(Integer calificacion) { this.calificacion = calificacion; }
}