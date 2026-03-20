package com.backend.proyect.service.usuario;

import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor

public class UserService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Registrar usuario con contraseña encriptada
    public Usuario register(Usuario usuario) {

        if (usuarioRepository.existsByCorreoElectronico(usuario.getCorreoElectronico())) {
            throw new RuntimeException("El correo ya está registrado: " + usuario.getCorreoElectronico());
        }

        return usuarioRepository.save(usuario);
    }

    // conexion con el metodo que encripta las contraseñas
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    // Verificar contraseñas
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    // Buscar usuario por correo electrónico
    public Optional<Usuario> findByCorreoElectronico(String correo) {
        return usuarioRepository.findByCorreoElectronico(correo);
    }

    // --- LÓGICA DE OTP Y VERIFICACIÓN ---

    // Generar un código aleatorio de 6 dígitos
    public String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    // Lógica para verificar el OTP (Registro)
    public boolean verifyAccount(Usuario usuario, String otp) {
        if (usuario.getVerify_otp() != null &&
                usuario.getVerify_otp().equals(otp) &&
                usuario.getVerify_otp_expire_at() > System.currentTimeMillis()) {

            usuario.setIsAccountVerified(true);
            usuario.setVerify_otp(null);
            usuario.setVerify_otp_expire_at(0L);
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }

    // Lógica para resetear contraseña
    public boolean resetPassword(Usuario usuario, String otp, String newPassword) {
        if (usuario.getReset_otp() != null &&
                usuario.getReset_otp().equals(otp) &&
                usuario.getReset_otp_expire_at() > System.currentTimeMillis()) {

            usuario.setPassword(encodePassword(newPassword));
            usuario.setReset_otp(null);
            usuario.setReset_otp_expire_at(0L);
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }

}
