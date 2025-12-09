package com.backend.proyect.repository.carrito;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.proyect.model.carrito.DetalleCarrito;

public interface DetalleCarritoRepository extends JpaRepository<DetalleCarrito,Integer>{
    List<DetalleCarrito> findByCarritoIdCarrito(Integer idCarrito);
}
