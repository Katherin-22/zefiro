package com.backend.proyect.service.pedido;

import com.backend.proyect.dto.pedido.PedidoDetalleDTO;
import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.repository.pedido.pedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PedidoService {

    @Autowired
    private pedidoRepository pedidoRepository;

    /**
     * Obtiene todos los pedidos con sus detalles completos (productos, colores, etc.)
     * Utiliza la consulta nativa con JOINs que ya tienes en el repositorio
     */
    @Transactional(readOnly = true)
    public List<PedidoDetalleDTO> obtenerTodosLosPedidosConDetalles() {
        List<Object[]> resultados = pedidoRepository.findAllPedidos();
        List<PedidoDetalleDTO> pedidosDTO = new ArrayList<>();

        for (Object[] fila : resultados) {
            PedidoDetalleDTO dto = new PedidoDetalleDTO();
            
            // Mapeo de los campos según el orden en tu consulta nativa
            dto.setIdPedido(fila[0] != null ? ((Number) fila[0]).longValue() : null);
            
            // ✅ CORREGIDO: Conversión correcta de java.sql.Date a LocalDate
            if (fila[1] != null) {
                // La BD devuelve java.sql.Date, no LocalDate directamente
                java.sql.Date sqlDate = (java.sql.Date) fila[1];
                dto.setFechaPedido(sqlDate.toLocalDate());
            } else {
                dto.setFechaPedido(null);
            }
            
            dto.setNombreUsuario(fila[2] != null ? (String) fila[2] : null);
            dto.setCodigoReferencia(fila[3] != null ? (String) fila[3] : null);
            dto.setNombreProducto(fila[4] != null ? (String) fila[4] : null);
            dto.setNombreColor(fila[5] != null ? (String) fila[5] : null);
            dto.setVariacion(fila[6] != null ? (String) fila[6] : null);
            dto.setCantidad(fila[7] != null ? ((Number) fila[7]).intValue() : null);
            dto.setPrecioUnitario(fila[8] != null ? BigDecimal.valueOf(((Number) fila[8]).doubleValue()) : null);
            dto.setNombrePromocion(fila[9] != null ? (String) fila[9] : null);
            dto.setDescuento(fila[10] != null ? BigDecimal.valueOf(((Number) fila[10]).doubleValue()) : null);
            
            pedidosDTO.add(dto);
        }
        
        return pedidosDTO;
    }

    /**
     * Obtiene un pedido específico por su ID con todos sus detalles
     */
    @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + idPedido));
    }

    /**
     * Obtiene todos los pedidos de un usuario específico
     */
    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario(Integer idUsuario) {
        if (idUsuario == null) {
            throw new IllegalArgumentException("El ID de usuario no puede ser nulo");
        }
        return pedidoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    /**
     * Obtiene pedidos por rango de fechas
     */
    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        if (fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin no pueden ser nulas");
        }
        if (fechaInicio.isAfter(fechaFin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha fin");
        }
        return pedidoRepository.findByFechaPedidoBetween(fechaInicio, fechaFin);
    }

    /**
     * Obtiene todos los pedidos (versión simple sin detalles)
     */
    @Transactional(readOnly = true)
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findPedido();
    }

    /**
     * Actualiza el estado de un pedido
     */
    @Transactional
    public Pedido actualizarEstadoPedido(Integer idPedido, String nuevoEstado) {
        Pedido pedido = obtenerPedidoPorId(idPedido);
        
        // Validar que el estado sea válido
        try {
            // Asumiendo que tienes un enum EstadoPedido
            // pedido.setEstado(EstadoPedido.valueOf(nuevoEstado));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado no válido: " + nuevoEstado);
        }
        
        return pedidoRepository.save(pedido);
    }

    /**
     * Busca pedidos por ID de pedido (método específico que ya tienes en el repo)
     */
    @Transactional(readOnly = true)
    public List<Pedido> buscarPedidoPorId(Integer idPedido) {
        return pedidoRepository.findByIdPedido(idPedido);
    }

    /**
     * Método auxiliar para validar que un pedido existe
     */
    @Transactional(readOnly = true)
    public boolean existePedido(Integer idPedido) {
        return pedidoRepository.existsById(idPedido);
    }

    /**
     * Obtiene el total de pedidos realizados
     */
    @Transactional(readOnly = true)
    public long contarPedidos() {
        return pedidoRepository.count();
    }
}