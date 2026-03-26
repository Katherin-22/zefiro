package com.backend.proyect.repository.carrito;

import  com.backend.proyect.model.carrito.Carrito;
import  com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.carrito.EstadoCarritoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    // Busca el carrito activo de un usuario específico (Método original)
    Optional<Carrito> findByUsuarioAndEstadoCarrito(Usuario usuario, EstadoCarritoEnum estadoCarrito);

    // Devuelve true si el usuario tiene al menos un carrito (activo o histórico)
    boolean existsByUsuario(Usuario usuario);

    // ===================================================================
    // 🌟 NUEVO MÉTODO CRÍTICO: Carga el Carrito con todos los detalles necesarios
    //    para la vista (Detalles, Stock y Producto) en una sola consulta.
    // ===================================================================
    @Query("SELECT c FROM Carrito c " +
            "LEFT JOIN FETCH c.detalles d " +
            "LEFT JOIN FETCH d.stock s " +
            "LEFT JOIN FETCH s.producto p " +
            "WHERE c.usuario = :usuario AND c.estadoCarrito = :estado")
    Optional<Carrito> findByUsuarioAndEstadoCarritoWithDetails(@Param("usuario") Usuario usuario, @Param("estado") EstadoCarritoEnum estado);


}




