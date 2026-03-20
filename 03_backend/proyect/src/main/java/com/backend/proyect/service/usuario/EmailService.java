package com.backend.proyect.service.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM}")
    private String fromEmail;

    // Método para el Registro
    public void sendVerificationEmail(String correoElectronico, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(correoElectronico);
        message.setSubject("Verificación de cuenta - zefiro");
        message.setText("Bienvenido a Zefiro.\n\n" +
                "Tu código de verificación es: " + otp + "\n\n" +
                "Este código expirará en 30 minutos.");
        mailSender.send(message);
    }

    // Método para Restablecer Contraseña
    public void sendPasswordResetEmail(String correoElectronico, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(correoElectronico);
        message.setSubject("Restablecer Contraseña - zefiro");
        message.setText("Has solicitado restablecer tu contraseña.\n\n" +
                "Tu código de seguridad es: " + otp + "\n\n" +
                "Este código expirará en 15 minutos. Si no solicitaste este cambio, ignora este correo.");
        mailSender.send(message);
    }
}
