package com.backend.proyect.repository.pedido;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.proyect.model.pedido.Pedido;

@Repository
public interface pedidoRepository extends JpaRepository<Pedido, Integer> {

    // OPCIÓN ALTERNATIVA con @Query (mantiene el nombre findByUsuarioId)
    @Query("SELECT p FROM Pedido p WHERE p.usuario.idUsuario = :idUsuario")
    List<Pedido> findByUsuarioId(@Param("idUsuario") Integer idUsuario);

    List<Pedido> findByEstado(String estado);

    List<Pedido> findByFechaPedidoBetween(LocalDate inicio, LocalDate fin);
}
