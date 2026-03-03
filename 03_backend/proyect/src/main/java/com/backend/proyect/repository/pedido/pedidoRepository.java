package com.backend.proyect.repository.pedido;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import com.backend.proyect.model.pedido.Pedido;


@Repository
public interface pedidoRepository extends JpaRepository<Pedido, Integer> {
    
    List<Pedido> findByIdPedido(Integer idPedido);
    
    List<Pedido> findByUsuarioIdUsuario(Integer idUsuario);

    
    List<Pedido> findByFechaPedidoBetween(LocalDate inicio, LocalDate fin);

    @Query("select p from Pedido p")
    List<Pedido> findPedido();

    @Query(value = "SELECT " +
            "p.idPedido, " +
            "p.fechaPedido, " +
            "u.nombreUsuario, " +
            "prod.codigoReferencia, " +
            "prod.nombreProducto, " +
            "color.nombreColor, " +
            "variacion.nombre AS nombreVariacion, " +
            "dc.cantidad, " +
            "dc.precioUnitario, " +
            "promocion.nombrePromocion, " +
            "promocion.descuento " +
            "FROM pedido p " +
            "JOIN usuario u ON p.idUsuario = u.idUsuario " +
            "JOIN carrito c ON p.idCarrito = c.idCarrito " +
            "JOIN detalleCarrito dc ON dc.idCarrito = c.idCarrito " +
            "JOIN stock s ON s.idStock = dc.idStock " +
            "JOIN producto prod ON prod.idProducto = s.idProducto " +
            "JOIN color ON color.idColor = s.idColor " +
            "JOIN variacion ON variacion.idVariacion = s.idVariacion " +
            "LEFT JOIN promocion ON promocion.idPromocion = prod.idPromocion",
            nativeQuery = true)
    List<Object[]> findAllPedidos();



}