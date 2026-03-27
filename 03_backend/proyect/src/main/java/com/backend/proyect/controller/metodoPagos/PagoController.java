package com.backend.proyect.controller.metodoPagos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.backend.proyect.model.metodoPagos.RespuestaPago;
import com.backend.proyect.model.metodoPagos.SolicitudPago;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.metodoPagos.RespuestaPagoRepository;
import com.backend.proyect.service.metodoPagos.PagoService;
import com.backend.proyect.service.usuario.UserService;
import com.backend.proyect.service.carrito.CarritoService;
import com.stripe.model.PaymentIntent;

@RestController
@RequestMapping("/api/payments")
public class PagoController {

    private final PagoService pagoService;
    private UserService userService;
    private RespuestaPagoRepository respuestaPagoRepository;
    private final CarritoService carritoService;

    @Autowired
    public PagoController(PagoService pagoService,
                          UserService userService,
                          RespuestaPagoRepository respuestaPagoRepository,
                          CarritoService carritoService ) {


        this.pagoService = pagoService;
        this.userService = userService;
        this.respuestaPagoRepository = respuestaPagoRepository;
        this.carritoService = carritoService;
    }

    @PostMapping("/create")
    public ResponseEntity<RespuestaPago> createPayment(@RequestBody SolicitudPago request,@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 1. Buscar el usuario en la base de datos
            Usuario usuario = userService.findByCorreoElectronico(userDetails.getUsername()).orElse(null);

            if (usuario == null) {
                return ResponseEntity.status(404).build();
            }

            double total = carritoService.calcularTotalCarrito(usuario.getIdUsuario());

            if (total <= 0) {
                System.err.println("❌ Error: El carrito está vacío o el total es 0");
                return ResponseEntity.status(400).build();
            }

            // 3. Convertir a centavos de forma segura
            // Usamos Math.round para evitar decimales infinitos que confundan a Stripe
            long montoEnCentavos = Math.round(total * 100);

            // DEBUG para que veas en consola cuánto se va a cobrar
            System.out.println("💰 Total Carrito: " + total);
            System.out.println("🪙 Enviando a Stripe (centavos): " + montoEnCentavos);

            // 4. EL "FRENO DE MANO": Si por error el monto es mayor a 10,000 USD (ejemplo), lo bloqueamos
            if (montoEnCentavos > 1000000000) { // $10,000.00
                System.err.println("⚠️ ALERTA: Monto demasiado alto detectado");
                return ResponseEntity.status(400).build();
            }

            // 2. Asignar el usuario al request
            request.setAmount(montoEnCentavos);
            request.setCurrency("cop");
            request.setUsuario(usuario);

            // 3. Crear el PaymentIntent
            PaymentIntent intent = pagoService.createPayment(request);

            // 4. Construir la respuesta
            RespuestaPago response = new RespuestaPago();
            response.setId(intent.getId());
            response.setClientSecret(intent.getClientSecret());
            response.setAmount(intent.getAmount());
            response.setCurrency(intent.getCurrency());
            response.setStatus(intent.getStatus());
            response.setUsuario(usuario);

            respuestaPagoRepository.save(response);

            System.out.println("Respuesta guardada en BD");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error real
            return ResponseEntity.status(500).build();
        }
    }
}
