package com.backend.proyect.controller.metodosPago;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.backend.proyect.model.metodosPago.RespuestaPago;
import com.backend.proyect.model.metodosPago.SolicitudPago;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.metodosPago.RespuestaPagoRepository;
import com.backend.proyect.service.metodosPago.PagoService;
import com.backend.proyect.service.usuario.UserService;
import com.stripe.model.PaymentIntent;

@RestController
@RequestMapping("/api/payments")
public class PagoController {

    private final PagoService pagoService;
    private UserService userService;
    private RespuestaPagoRepository respuestaPagoRepository;

    @Autowired
    public PagoController(PagoService pagoService,
                          UserService userService,
                          RespuestaPagoRepository respuestaPagoRepository ) {

        this.pagoService = pagoService;
        this.userService = userService;
        this.respuestaPagoRepository = respuestaPagoRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<RespuestaPago> createPayment(@RequestBody SolicitudPago request,@AuthenticationPrincipal UserDetails userDetails) {
        try {
           // 1. Buscar el usuario en la base de datos
            Usuario usuario = userService.findByCorreoElectronico(userDetails.getUsername()).orElse(null);
            
            if (usuario == null) {
                return ResponseEntity.status(404).build();
            }
            
            // 2. Asignar el usuario al request
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
