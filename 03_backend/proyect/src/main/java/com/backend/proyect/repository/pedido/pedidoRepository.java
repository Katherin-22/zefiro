package com.backend.proyect.repository.pedido;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.proyect.model.pedido.EstadoPedido;
import com.backend.proyect.model.pedido.Pedido;

@Repository
public interface pedidoRepository extends JpaRepository<Pedido, Integer> {
    
    List<Pedido> findByUsuarioIdUsuario(Integer idUsuario);
    
    List<Pedido> findByEstadoPedido(EstadoPedido estadoPedido);
    
    List<Pedido> findByFechaPedidoBetween(LocalDate inicio, LocalDate fin);
}