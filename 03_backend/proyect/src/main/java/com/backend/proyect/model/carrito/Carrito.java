package com.backend.proyect.model.carrito;

import java.time.LocalDate;

import com.backend.proyect.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Carrito")

public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Autoincrement en MySQL
    @Column(name = "idCarrito")
    private Integer idCarrito;

    @Column(name = "total", nullable = false)
    private Double total;

    @Column(name = "fechaCreacion", nullable = false)
    private LocalDate fechaCreacion;

    // Relación muchos a uno con Usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    public Carrito() {
    }

    public Carrito(Double total, LocalDate fechaCreacion, 
    Usuario usuario) {
        this.total = total;
        this.fechaCreacion = fechaCreacion;
        this.usuario = usuario;
    }

    // getters y setters    

    public Integer getIdCarrito() {
        return idCarrito;
    }

    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public LocalDate getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDate fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

}

