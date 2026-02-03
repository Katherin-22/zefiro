package com.backend.proyect.controller.carrito;

import com.backend.proyect.dto.carrito.AgregarItemDTO;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.service.carrito.CarritoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;
import java.util.List; // Importar List

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    // Endpoint: /api/carrito/{idUsuario}
    @GetMapping("/{idUsuario}")
    public ResponseEntity<Carrito> obtenerCarrito(@PathVariable Integer idUsuario) {
        try {
            Carrito carrito = carritoService.obtenerCarritoActivo(idUsuario);
            return ResponseEntity.ok(carrito);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint: /api/carrito/agregar/{idUsuario}
    @PostMapping("/agregar/{idUsuario}")
    public ResponseEntity<Carrito> agregarItem(
            @PathVariable Integer idUsuario,
            @Valid @RequestBody AgregarItemDTO itemDTO) {
        try {
            Carrito carritoActualizado = carritoService.agregarOActualizarItem(idUsuario, itemDTO);
            return ResponseEntity.ok(carritoActualizado);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // o manejar errores más específicos
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); // Conflict por stock insuficiente
        }
    }

    // ===============================================
    // ENDPOINT PARA SINCRONIZACIÓN (NUEVO)
    // POST /api/carrito/sincronizar/{idUsuario}
    // ===============================================
    @PostMapping("/sincronizar/{idUsuario}")
    public ResponseEntity<Carrito> sincronizarCarrito(
            @PathVariable Integer idUsuario,
            @Valid @RequestBody List<AgregarItemDTO> itemsInvitado) {

        try {
            // Llama al servicio para realizar la sincronización
            Carrito carritoSincronizado = carritoService.sincronizarCarrito(idUsuario, itemsInvitado);

            // Retorna el carrito completo actualizado.
            return ResponseEntity.ok(carritoSincronizado);

        } catch (NoSuchElementException e) {
            // Usuario o Stock no encontrado
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            // Conflicto de Stock: El stock combinado del invitado excede el disponible
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint : /api/carrito/checkout/{idUsuario}/{idMetodoPago}
    @PostMapping("/checkout/{idUsuario}/{idMetodoPago}")
    public ResponseEntity<?> finalizarCheckout(
            @PathVariable Integer idUsuario,
            @PathVariable Integer idMetodoPago) {
        try {
            Pedido pedido = carritoService.finalizarCheckout(idUsuario, idMetodoPago);
            // Retorna el ID del pedido y la confirmación
            return ResponseEntity.ok(pedido);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); // Carrito vacío
        } catch (IllegalArgumentException e) {
            // Stock insuficiente
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error de datos: " + e.getMessage());
        } catch (Exception e) {
            // Cualquier otro error de transacción
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al procesar el pago: " + e.getMessage());
        }
    }
}