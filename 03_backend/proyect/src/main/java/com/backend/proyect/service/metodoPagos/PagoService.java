package com.backend.proyect.service.metodoPagos;

import org.springframework.stereotype.Service;

import com.backend.proyect.model.metodoPagos.SolicitudPago;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

@Service
public class PagoService {
    
    public PaymentIntent createPayment (SolicitudPago request) throws Exception {

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            // 1. Traer total del carrito
            //double total = carritoService.obtenerTotalCarrito(idUsuario);

            // 2. Convertir a centavos para Stripe
            //Long montoStripe = (long) (total * 100);

            //setAmount(montoStripe)   

            .setAmount(request.getAmount())
            .setCurrency(request.getCurrency())
            .setDescription(request.getDescription())
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();
        return PaymentIntent.create(params);
    }
}