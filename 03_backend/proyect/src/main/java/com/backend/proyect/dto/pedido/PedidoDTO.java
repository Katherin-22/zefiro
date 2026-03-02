package com.backend.proyect.dto.pedido;

import java.time.LocalDate;

public class PedidoDTO {
    private Integer idPedido;
    private LocalDate fechaPedido;
    private Integer idUsuario;
    private Integer idCarrito;
    private Integer idPromocion;
    private Integer idMetodoPago;
    private String estado;
    private Double total_final;

    //constructores
    public PedidoDTO() {}

    //Getter y setter 
    public Integer getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Integer idPedido) {
        this.idPedido = idPedido;
    }

    public LocalDate getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDate fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

        public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

        public Integer getIdCarrito() {
        return idCarrito;
    }

    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }

        public Integer getIdPromocion() {
        return idPromocion;
    }

    public void setIdPromocion(Integer idPromocion) {
        this.idPromocion = idPromocion;
    }

    public Integer getIdMetodoPago () {
        return idMetodoPago;
    }

    public void setIdMetodoPago(Integer idMetodoPago) {
        this.idMetodoPago = idMetodoPago;
    }

    public String getEstado () {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Double getTotal_final() {
        return total_final;
    }

    public void setTotal_final(Double total_final) {
        this.total_final = total_final;
    }

}
