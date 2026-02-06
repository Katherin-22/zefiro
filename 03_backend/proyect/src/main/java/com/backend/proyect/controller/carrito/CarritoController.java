package com.backend.proyect.controller.carrito;

import com.backend.proyect.dto.carrito.AgregarItemDTO;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.service.carrito.CarritoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.List;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    // ===============================================
    // OBTENER CARRITO
    // GET /api/carrito/{idUsuario}
    // ===============================================
    @GetMapping("/{idUsuario}")
    public ResponseEntity<Carrito> obtenerCarrito(@PathVariable Integer idUsuario) {
        try {
            Carrito carrito = carritoService.obtenerCarritoActivo(idUsuario);
            return ResponseEntity.ok(carrito);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ===============================================
    // AGREGAR O ACTUALIZAR ITEM
    // POST /api/carrito/agregar/{idUsuario}
    // ===============================================
    @PostMapping("/agregar/{idUsuario}")
    public ResponseEntity<Carrito> agregarItem(
            @PathVariable Integer idUsuario,
            @Valid @RequestBody AgregarItemDTO itemDTO) {
        try {
            Carrito carritoActualizado = carritoService.agregarOActualizarItem(idUsuario, itemDTO);
            return ResponseEntity.ok(carritoActualizado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
    }

    // ===============================================
    // SINCRONIZACIÓN DE CARRITO (Invitado -> Logueado)
    // POST /api/carrito/sincronizar/{idUsuario}
    // ===============================================
    @PostMapping("/sincronizar/{idUsuario}")
    public ResponseEntity<Carrito> sincronizarCarrito(
            @PathVariable Integer idUsuario,
            @Valid @RequestBody List<AgregarItemDTO> itemsInvitado) {
        try {
            Carrito carritoSincronizado = carritoService.sincronizarCarrito(idUsuario, itemsInvitado);
            return ResponseEntity.ok(carritoSincronizado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===============================================
    // ACTUALIZAR CANTIDAD PRODUCTOS CARRITO (PATCH)
    // PATCH /api/carrito/{idDetalleCarrito}
    // ===============================================
    @PatchMapping("/{idDetalleCarrito}")
    public ResponseEntity<Carrito> actualizarCantidad(
            @PathVariable Integer idDetalleCarrito,
            @RequestBody Map<String, Integer> body) {
        try {
            Integer nuevaCantidad = body.get("cantidad");
            if (nuevaCantidad == null) {
                return ResponseEntity.badRequest().build();
            }
            Carrito carritoActualizado = carritoService.actualizarCantidadItem(idDetalleCarrito, nuevaCantidad);
            return ResponseEntity.ok(carritoActualizado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // ===============================================
    // ELIMINAR ITEM ESPECÍFICO
    // DELETE /api/carrito/eliminar/{idUsuario}/{idDetalleCarrito}
    // ===============================================
    @DeleteMapping("/eliminar/{idUsuario}/{idDetalleCarrito}")
    public ResponseEntity<Carrito> eliminarItem(
            @PathVariable Integer idUsuario,
            @PathVariable Integer idDetalleCarrito) {
        try {
            carritoService.eliminarItem(idUsuario, idDetalleCarrito);
            // Retornamos el carrito actualizado para que el frontend se refresque
            Carrito carritoActualizado = carritoService.obtenerCarritoActivo(idUsuario);
            return ResponseEntity.ok(carritoActualizado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
    }

    // ===============================================
    // VACIAR TODO EL CARRITO
    // DELETE /api/carrito/vaciar/{idUsuario}
    // ===============================================
    @DeleteMapping("/vaciar/{idUsuario}")
    public ResponseEntity<?> vaciarCarrito(@PathVariable Integer idUsuario) {
        try {
            carritoService.vaciarCarrito(idUsuario);
            return ResponseEntity.ok().body(Map.of("message", "Carrito vaciado correctamente"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===============================================
    // FINALIZAR COMPRA / CHECKOUT
    // POST /api/carrito/checkout/{idUsuario}/{idMetodoPago}
    // ===============================================
    @PostMapping("/checkout/{idUsuario}/{idMetodoPago}")
    public ResponseEntity<?> finalizarCheckout(
            @PathVariable Integer idUsuario,
            @PathVariable Integer idMetodoPago) {
        try {
            Pedido pedido = carritoService.finalizarCheckout(idUsuario, idMetodoPago);
            return ResponseEntity.ok(pedido);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al procesar el pago: " + e.getMessage());
        }
    }
}