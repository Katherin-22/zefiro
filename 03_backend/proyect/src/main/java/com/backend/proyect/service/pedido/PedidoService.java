package com.backend.proyect.service.pedido;

import com.backend.proyect.dto.pedido.PedidoDetalleDTO;
import com.backend.proyect.model.pedido.EstadoPedido;
import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.repository.pedido.pedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PedidoService {

    @Autowired
    private pedidoRepository pedidoRepository;

    @Transactional(readOnly = true)
    public List<PedidoDetalleDTO> obtenerTodosLosPedidosConDetalles() {
        List<Object[]> resultados = pedidoRepository.findAllPedidos();
        List<PedidoDetalleDTO> pedidosDTO = new ArrayList<>();

        for (Object[] fila : resultados) {
            PedidoDetalleDTO dto = new PedidoDetalleDTO();

            dto.setIdPedido(fila[0] != null ? ((Number) fila[0]).longValue() : null);

            if (fila[1] != null) {
                java.sql.Date sqlDate = (java.sql.Date) fila[1];
                dto.setFechaPedido(sqlDate.toLocalDate());
            }

            // NUEVO: Mapear el estado (ahora está en la posición 2)
            dto.setEstado(fila[2] != null ? (String) fila[2] : null);

            // Los índices se corren por la nueva columna
            dto.setNombreUsuario(fila[3] != null ? (String) fila[3] : null);
            dto.setCodigoReferencia(fila[4] != null ? (String) fila[4] : null);
            dto.setNombreProducto(fila[5] != null ? (String) fila[5] : null);
            dto.setNombreColor(fila[6] != null ? (String) fila[6] : null);
            dto.setNombre(fila[7] != null ? (String) fila[7] : null);
            dto.setCantidad(fila[8] != null ? ((Number) fila[8]).intValue() : null);
            dto.setPrecioUnitario(fila[9] != null ? BigDecimal.valueOf(((Number) fila[9]).doubleValue()) : null);
            dto.setNombrePromocion(fila[10] != null ? (String) fila[10] : null);
            dto.setDescuento(fila[11] != null ? BigDecimal.valueOf(((Number) fila[11]).doubleValue()) : null);

            pedidosDTO.add(dto);

        }

        return pedidosDTO;
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Integer idPedido) {
        return pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + idPedido));
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario(Integer idUsuario) {
        return pedidoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorRangoFechas(LocalDate fechaInicio, LocalDate fechaFin) {
        return pedidoRepository.findByFechaPedidoBetween(fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepository.findPedido();
    }

    /**
     * ✅ CORREGIDO: Actualiza el estado del pedido
     */
    @Transactional
    public Pedido actualizarEstadoPedido(Integer idPedido, String nuevoEstadoStr) {
        // 1. Buscar el pedido
        Pedido pedido = obtenerPedidoPorId(idPedido);

        System.out.println("🔍 Pedido encontrado - ID: " + idPedido + ", Estado actual: " + pedido.getEstadoPedido());
        System.out.println("📥 Nuevo estado recibido: '" + nuevoEstadoStr + "'");

        // 2. MAPEAR String del frontend al Enum
        EstadoPedido nuevoEstado;

        switch (nuevoEstadoStr) {
            case "Pendiente":
                nuevoEstado = EstadoPedido.Pendiente;
                break;
            case "Procesando":
                // Mapear "En proceso" (con espacio) a "En_proceso" (con guión bajo)
                nuevoEstado = EstadoPedido.Procesando;
                break;
            case "Entregado":
                nuevoEstado = EstadoPedido.Entregado;
                break;
            default:
                throw new RuntimeException("Estado no válido: '" + nuevoEstadoStr +
                        "'. Debe ser: Pendiente, Procesando o Entregado");
        }

        // 3. Asignar el nuevo estado
        pedido.setEstadoPedido(nuevoEstado);

        // 4. Guardar en base de datos
        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        System.out.println("✅ Estado actualizado a: " + pedidoActualizado.getEstadoPedido());

        return pedidoActualizado;
    }

    @Transactional(readOnly = true)
    public List<Pedido> buscarPedidoPorId(Integer idPedido) {
        return pedidoRepository.findByIdPedido(idPedido);
    }

    @Transactional(readOnly = true)
    public boolean existePedido(Integer idPedido) {
        return pedidoRepository.existsById(idPedido);
    }

    @Transactional(readOnly = true)
    public long contarPedidos() {
        return pedidoRepository.count();
    }
}