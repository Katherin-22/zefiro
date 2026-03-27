package com.backend.proyect.dto.carrito;

public class    DetalleCarritoRequest {

    private Integer cantidad;
    private Double precioUnitario;
    private Integer porcentajeDescuento;


    private Integer idCarrito;
    private Integer idStock;
    private Integer idPromocion;

    // Getters y Setters
    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(Double precioUnitario) { this.precioUnitario = precioUnitario; }

    public Integer getPorcentajeDescuento() {
        return porcentajeDescuento;
    }

    public void setPorcentajeDescuento(Integer porcentajeDescuento) {
        this.porcentajeDescuento = porcentajeDescuento;
    }

    public Integer getIdCarrito() { return idCarrito; }

    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }

    public Integer getIdStock() { return idStock; }

    public void setIdStock(Integer idStock) {
        this.idStock = idStock;
    }

    public Integer getIdPromocion() { return idPromocion; }

    public void setIdPromocion(Integer idPromocion) {
        this.idPromocion = idPromocion;
    }

}


