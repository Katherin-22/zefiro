package com.backend.proyect.dto.productos;

import com.backend.proyect.model.productos.Producto.EstadoProducto;

public interface StockGeneralProjection {
    // Datos del Producto (tabla principal)
    Integer getIdProducto();
    String getCodigoReferencia();
    String getNombreProducto();
    String getDescripcion();              // corregido: getDescripcion (con mayúscula)
    String getNombreTipoProducto();
    String getNombrePublico();
    String getNombreCategoria();
    String getNombreMaterial();
    Double getPrecio();
    EstadoProducto getEstadoProducto();    // estado del producto
    
    // Datos del Stock (pueden ser null)
    Integer getIdStock();                
    Integer getStockActual();
    Integer getStockMinimo();              
    String getNombreColor();                
    String getNombreTalla();                
}