package com.backend.proyect.dto.carrito;

import java.time.LocalDate;

public class CarritoDTO {
    //unicamente se le pasara esto al usuario
    private Integer idCarrito;  
    private Double total;
    private LocalDate fechaCreacion;

    private Integer idUsuario;

    // Getters y Setters

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

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
 
}