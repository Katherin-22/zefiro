package com.backend.proyect.repository.carrito;

import  com.backend.proyect.model.carrito.Carrito;
import  com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.carrito.EstadoCarritoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    // Busca el carrito activo de un usuario específico
    Optional<Carrito> findByUsuarioAndEstadoCarrito(Usuario usuario, EstadoCarritoEnum estadoCarrito);
}




