// ComentarioProducto.java
package com.backend.proyect.model.comentario;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.usuario.Usuario;

@Entity
@Table(name = "ComentarioProducto",
        uniqueConstraints = @UniqueConstraint(columnNames = {"idUsuario", "idProducto"}))
public class ComentarioProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idComentario;

    @ManyToOne
    @JoinColumn(name = "idProducto", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comentario;

    @Column(nullable = false)
    private Integer calificacion;

    @Column(nullable = false)
    private LocalDateTime fechaComentario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoComentario estado = EstadoComentario.Activo;

    public enum EstadoComentario {
        Activo, Eliminado
    }

    // Constructores
    public ComentarioProducto() {
        this.fechaComentario = LocalDateTime.now();
    }

    // Getters y Setters
    public Integer getIdComentario() { return idComentario; }
    public void setIdComentario(Integer idComentario) { this.idComentario = idComentario; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public Integer getCalificacion() { return calificacion; }
    public void setCalificacion(Integer calificacion) {
        if (calificacion < 1 || calificacion > 5) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5");
        }
        this.calificacion = calificacion;
    }

    public LocalDateTime getFechaComentario() { return fechaComentario; }
    public void setFechaComentario(LocalDateTime fechaComentario) { this.fechaComentario = fechaComentario; }

    public EstadoComentario getEstado() { return estado; }
    public void setEstado(EstadoComentario estado) { this.estado = estado; }
}