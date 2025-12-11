package com.backend.proyect.repository.pedido;

import com.backend.proyect.model.pedido.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface pedidoRepository extends JpaRepository<Pedido, Integer> {
    
    List<Pedido> findByUsuarioId(Integer idUsuario);
    
    List<Pedido> findByEstado(String estado);
    
    List<Pedido> findByFechaPedidoBetween(LocalDate inicio, LocalDate fin);
}