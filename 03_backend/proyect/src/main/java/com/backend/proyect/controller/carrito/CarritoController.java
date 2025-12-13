/*package com.backend.proyect.controller.carrito;

import com.backend.proyect.dto.carrito.AgregarItemDTO;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.entity.Pedido;
import com.backend.proyect.service.carrito.CarritoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;

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


*/