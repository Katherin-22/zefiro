package com.backend.proyect.controller.metodoPagos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.proyect.model.metodoPagos.RespuestaPago;
import com.backend.proyect.model.metodoPagos.SolicitudPago;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.metodoPagos.RespuestaPagoRepository;
import com.backend.proyect.service.metodoPagos.PagoService;
import com.backend.proyect.service.metodoPagos.UsuarioService;
import com.stripe.model.PaymentIntent;

@RestController
@RequestMapping("/api/payments")
public class PagoController {

    private final PagoService pagoService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private RespuestaPagoRepository respuestaPagoRepository;

    @Autowired
    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/create/{idUsuario}")
    public ResponseEntity<RespuestaPago> createPayment(@RequestBody SolicitudPago request, @PathVariable Integer idUsuario) {
        try {
           // 1. Buscar el usuario en la base de datos
            Usuario usuario = usuarioService.obtenerUsuarioPorId(idUsuario);
            
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

            return ResponseEntity.ok(response);     

        } catch (Exception e) {
            e.printStackTrace(); // Para ver el error real
            return ResponseEntity.status(500).build();
        }
    }
}
