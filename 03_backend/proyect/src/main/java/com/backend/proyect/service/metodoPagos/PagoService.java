package com.backend.proyect.service.metodoPagos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.proyect.model.metodoPagos.SolicitudPago;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.service.carrito.CarritoService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

@Service
public class PagoService {
    @Autowired  // 1. INYECTA CarritoService
    private CarritoService carritoService;
    
    public PaymentIntent createPayment (SolicitudPago request) throws Exception {

        Usuario usuario = request.getUsuario(); // 👈 AQUÍ

        Integer idUsuario = usuario.getIdUsuario();

        // 1. Traer total del carrito
        double total = carritoService.calcularTotalCarrito(idUsuario);

        // 3. Convertir a centavos para Stripe
        Long montoStripe = Math.round(total * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()

            .setAmount(montoStripe)
            .setCurrency(request.getCurrency())
            .setDescription(request.getDescription())
            .putMetadata("name", usuario.getNombreUsuario()) // ✔ name
            .putMetadata("userId", usuario.getIdUsuario().toString())
            .putMetadata("email", usuario.getCorreoElectronico())            
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();
        return PaymentIntent.create(params);
    }
}