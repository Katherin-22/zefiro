package com.backend.proyect.repository.carrito;

import com.backend.proyect.model.carrito.DetalleCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface DetalleCarritoRepository extends JpaRepository<DetalleCarrito, Integer> {

    // Buscar un detalle específico por ID de Carrito y ID de Stock (variación del producto)
    Optional<DetalleCarrito> findByCarritoIdCarritoAndStockIdStock(Integer idCarrito, Integer idStock);

    // Método para borrar todos los detalles de un carrito específico
    void deleteByCarritoIdCarrito(Integer idCarrito);
}


