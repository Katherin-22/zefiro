package com.backend.proyect.dto.carrito;

public class DetalleCarritoDTO {
    //unicamente se le pasara esto al usuario
    private Integer idDetalleCarrito;  
    private Double precioUnitario;
    private Integer cantidad;
    private Integer descuentoProd;
    private Double subtotal;

    private Integer idCarrito;
    private Integer idStock;

    private String nombreProducto;
    private String urlImagen;
    private Double precio;
    private String nombre;
    private String nombreColor;

    // Getters y Setters

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
    public Integer getIdCarrito() {
        return idCarrito;
    }
    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }
    public Integer getIdStock() {
        return idStock;
    }
    public void setIdStock(Integer idStock) {
        this.idStock = idStock;
    }
    public String getNombreProducto() {
        return nombreProducto;
    }
    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }
    public String getUrlImagen() {
        return urlImagen;
    }
    public void setUrlImagen(String urlImagen) {
        this.urlImagen = urlImagen;
    }
    public Double getPrecio() {
        return precio;
    }
    public void setPrecio(Double precio) {
        this.precio = precio;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getNombreColor() {
        return nombreColor;
    }
    public void setNombreColor(String nombreColor) {
        this.nombreColor = nombreColor;
    }

}