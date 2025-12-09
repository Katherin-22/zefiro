package com.backend.proyect.model.carrito;

import java.time.LocalDate;

import com.backend.proyect.model.productos.Color;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.productos.Variacion;
import com.backend.proyect.model.productos.Stock;
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
@Table(name = "DetalleCarrito")

public class DetalleCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Autoincrement en MySQL
    @Column(name = "idDetalleCarrito")
    private Integer idDetalleCarrito;

    @Column(name = "precioUnitario", nullable = false)
    private Double precioUnitario;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "descuentoProd", nullable = false)
    private Integer descuentoProd;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    // Relación muchos a uno con carrito
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCarrito", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Carrito carrito;

    // Relación muchos a uno con Stock
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idStock", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Stock stock;

    public DetalleCarrito() {
    }

    public DetalleCarrito(Double precioUnitario, Integer cantidad,
            Integer descuentoProd, Double subtotal, Carrito carrito, Stock stock) {
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
        this.descuentoProd = descuentoProd;
        this.subtotal = subtotal;
        this.carrito = carrito;
        this.stock = stock;
    }

    // getters y setters    
    public Integer getIdDetalleCarrito() {
        return idDetalleCarrito;
    }

    public void setIdDetalleCarrito(Integer idDetalleCarrito) {
        this.idDetalleCarrito = idDetalleCarrito;
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Integer getDescuentoProd() {
        return descuentoProd;
    }

    public void setDescuentoProd(Integer descuentoProd) {
        this.descuentoProd = descuentoProd;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Carrito getCarrito() {
        return carrito;
    }

    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

}
