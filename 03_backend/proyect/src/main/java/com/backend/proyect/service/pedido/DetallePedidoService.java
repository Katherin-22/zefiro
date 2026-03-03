package com.backend.proyect.service.pedido;

import com.backend.proyect.model.pedido.DetallePedido;
import com.backend.proyect.repository.pedido.DetallePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DetallePedidoService {

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    /**
     * Obtiene todos los detalles de un pedido específico
     */
    @Transactional(readOnly = true)
    public List<DetallePedido> obtenerDetallesPorPedido(Integer idPedido) {
        // Asumiendo que agregas este método en el repositorio
        // return detallePedidoRepository.findByPedidoIdPedido(idPedido);
        return null; // Temporal hasta que agregues el método
    }

    /**
     * Obtiene un detalle específico por su ID
     */
    @Transactional(readOnly = true)
    public DetallePedido obtenerDetallePorId(Integer idDetalle) {
        if (idDetalle == null) {
            throw new RuntimeException("ID de detalle no puede ser nulo");
        }
        return detallePedidoRepository.findById(idDetalle)
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado con ID: " + idDetalle));
    }
}