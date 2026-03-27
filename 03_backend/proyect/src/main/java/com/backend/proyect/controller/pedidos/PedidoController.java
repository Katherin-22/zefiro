package com.backend.proyect.controller.pedidos;

import com.backend.proyect.dto.pedido.PedidoDetalleDTO;
import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.service.pedido.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // Endpoints principales
    @GetMapping("/detalles")
    public ResponseEntity<List<PedidoDetalleDTO>> obtenerTodosLosPedidosConDetalles() {
        List<PedidoDetalleDTO> pedidos = pedidoService.obtenerTodosLosPedidosConDetalles();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> obtenerTodosLosPedidos() {
        List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Integer id) {
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        return ResponseEntity.ok(pedido);
    }

    // Endpoints de búsqueda
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Pedido>> obtenerPedidosPorUsuario(@PathVariable Integer idUsuario) {
        List<Pedido> pedidos = pedidoService.obtenerPedidosPorUsuario(idUsuario);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/buscar/{idPedido}")
    public ResponseEntity<List<Pedido>> buscarPedidoPorId(@PathVariable Integer idPedido) {
        List<Pedido> pedidos = pedidoService.buscarPedidoPorId(idPedido);
        return ResponseEntity.ok(pedidos);
    }

    // Endpoint por fechas
    @GetMapping("/rango-fechas")
    public ResponseEntity<List<Pedido>> obtenerPedidosPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<Pedido> pedidos = pedidoService.obtenerPedidosPorRangoFechas(fechaInicio, fechaFin);
        return ResponseEntity.ok(pedidos);
    }

    // Endpoint para actualizar estado
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> actualizarEstadoPedido(
            @PathVariable Integer id,
            @RequestParam String estado) {
        Pedido pedido = pedidoService.actualizarEstadoPedido(id, estado);
        return ResponseEntity.ok(pedido);
    }

    // Endpoint para verificar existencia
    @GetMapping("/{id}/existe")
    public ResponseEntity<Boolean> existePedido(@PathVariable Integer id) {
        boolean existe = pedidoService.existePedido(id);
        return ResponseEntity.ok(existe);
    }

    // Endpoint para contar pedidos
    @GetMapping("/contar")
    public ResponseEntity<Long> contarPedidos() {
        long total = pedidoService.contarPedidos();
        return ResponseEntity.ok(total);
    }
}