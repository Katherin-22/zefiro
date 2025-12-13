package com.backend.proyect.controller.metodoPagos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.proyect.model.metodoPagos.RespuestaPago;
import com.backend.proyect.model.metodoPagos.SolicitudPago;
import com.backend.proyect.service.metodoPagos.PagoService;
import com.stripe.model.PaymentIntent;

@RestController
@RequestMapping("/api/payments")
public class PagoController {

    private final PagoService pagoService;

    @Autowired
    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/create")
    public ResponseEntity<RespuestaPago> createPayment(@RequestBody SolicitudPago request) {
        try {
            PaymentIntent intent = pagoService.createPayment(request);

            RespuestaPago response = new RespuestaPago(
                    intent.getId(),
                    intent.getClientSecret(),
                    intent.getAmount(),
                    intent.getCurrency(),
                    intent.getStatus()
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
