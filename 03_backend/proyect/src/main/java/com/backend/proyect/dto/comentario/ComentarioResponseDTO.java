// ComentarioResponseDTO.java
package com.backend.proyect.dto.comentario;

import java.time.LocalDateTime;

public class ComentarioResponseDTO {
    
    private Integer idComentario;
    private Integer idProducto;
    private Integer idUsuario;
    private String nombreUsuario;
    private String comentario;
    private Integer calificacion;
    private LocalDateTime fechaComentario;
    private String estado;
    private Double promedioCalificacion;
    private Long totalComentarios;
    
    // Getters y Setters
    public Integer getIdComentario() { return idComentario; }
    public void setIdComentario(Integer idComentario) { this.idComentario = idComentario; }
    
    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }
    
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    
    public Integer getCalificacion() { return calificacion; }
    public void setCalificacion(Integer calificacion) { this.calificacion = calificacion; }
    
    public LocalDateTime getFechaComentario() { return fechaComentario; }
    public void setFechaComentario(LocalDateTime fechaComentario) { this.fechaComentario = fechaComentario; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public Double getPromedioCalificacion() { return promedioCalificacion; }
    public void setPromedioCalificacion(Double promedioCalificacion) { this.promedioCalificacion = promedioCalificacion; }
    
    public Long getTotalComentarios() { return totalComentarios; }
    public void setTotalComentarios(Long totalComentarios) { this.totalComentarios = totalComentarios; }
}