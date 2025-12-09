package com.backend.proyect.repository.carrito;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.proyect.model.carrito.Carrito;

public interface CarritoRepository extends JpaRepository<Carrito,Integer>{
    Optional<Carrito> findByUsuario_IdUsuario(Integer idUsuario);
}
