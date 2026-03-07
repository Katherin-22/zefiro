package com.backend.proyect.controller.usuario;

import com.backend.proyect.dto.usuario.ResetPasswordRequest;
import com.backend.proyect.dto.usuario.UsuarioRequest;
import com.backend.proyect.exception.usuario.ResourceNotFoundException;
import com.backend.proyect.model.usuario.EstadoUsuario;
import com.backend.proyect.model.usuario.Rol;
import com.backend.proyect.model.usuario.TipoDocumento;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.usuario.EstadoUsuarioRepository;
import com.backend.proyect.repository.usuario.RolRepository;
import com.backend.proyect.repository.usuario.TipoDocumentoRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.security.usuario.JwtUtil;
import com.backend.proyect.service.usuario.UserService;
import com.backend.proyect.service.usuario.EmailService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final EstadoUsuarioRepository estadoUsuarioRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    // Registrar usuario
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UsuarioRequest usuarioRequest) {

        // Buscar las entidades por ID, si no existen, lanza una excepción
        Rol rol = rolRepository.findById(usuarioRequest.getIdRol())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        TipoDocumento tipoDocumento = tipoDocumentoRepository.findById(usuarioRequest.getIdTipoDeDocumento())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de documento no encontrado"));

        EstadoUsuario estadoUsuario = estadoUsuarioRepository.findById(usuarioRequest.getIdEstadoUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Estado de usuario no encontrado"));

        // Crear la entidad Usuario
        Usuario usuario = new Usuario();
        usuario.setNumeroDocumento(usuarioRequest.getNumeroDocumento());
        usuario.setNombreUsuario(usuarioRequest.getNombreUsuario());
        usuario.setPrimerApellido(usuarioRequest.getPrimerApellido());
        usuario.setSegundoApellido(usuarioRequest.getSegundoApellido());
        usuario.setTelefono(usuarioRequest.getTelefono());
        usuario.setPassword(userService.encodePassword(usuarioRequest.getPassword()));
        usuario.setCorreoElectronico(usuarioRequest.getCorreoElectronico());
        usuario.setDireccion(usuarioRequest.getDireccion());

        // Asignar los objetos de las entidades a la entidad principal
        usuario.setRol(rol);
        usuario.setTipo_de_documento(tipoDocumento);
        usuario.setEstado_usuario(estadoUsuario);

        // --- LÓGICA DE OTP ---
        usuario.setIsAccountVerified(false); // La cuenta inicia desactivada
        String otp = userService.generateOtp();
        usuario.setVerify_otp(otp);
        usuario.setVerify_otp_expire_at(System.currentTimeMillis() + (30 * 60 * 1000)); // Expira en 30 min

        Usuario saved = userService.register(usuario);

        // --- INTEGRACIÓN ENVIAR EMAIL ---
        try {
            emailService.sendVerificationEmail(saved.getCorreoElectronico(), otp);
        } catch (Exception e) {
            // Si el correo falla, notificamos pero el usuario ya está creado
            System.err.println("Error enviando correo: " + e.getMessage());
        }

        Map<String, Object> userData = Map.of(
                "id", saved.getIdUsuario(),
                "nombre", saved.getNombreUsuario(),
                "email", saved.getCorreoElectronico()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Usuario registrado con éxito.Revisa tu correo para verificar.");
        response.put("data", userData);

        return ResponseEntity.ok(response);
    }

    // 2. VERIFICAR OTP DE CUENTA
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        String correoElectronico = body.get("correoElectronico");
        String otp = body.get("otp");

        Usuario usuario = usuarioRepository.findByCorreoElectronico(correoElectronico)
                .orElseThrow(() -> new ResourceNotFoundException("El email no existe"));

        if (userService.verifyAccount(usuario, body.get("otp"))) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Cuenta verificada con éxito."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Código inválido o expirado."));
        }
    }

    // 3. SOLICITAR OTP PARA RESTABLECER CONTRASEÑA
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestParam String correoElectronico) {
        Usuario usuario = usuarioRepository.findByCorreoElectronico(correoElectronico)
                .orElseThrow(() -> new ResourceNotFoundException("El email no existe"));

        String resetOtp = userService.generateOtp();
        usuario.setReset_otp(resetOtp); // Asegúrate de tener este campo en tu modelo
        usuario.setReset_otp_expire_at(System.currentTimeMillis() + (15 * 60 * 1000)); // 15 min
        usuarioRepository.save(usuario);

        try {
            emailService.sendPasswordResetEmail(correoElectronico, resetOtp); // Crea este método en tu EmailService
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP de restablecimiento enviado."));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al enviar el correo.");
        }
    }

    // 4. RESTABLECER CONTRASEÑA
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByCorreoElectronico(request.getCorreoElectronico())
                .orElseThrow(() -> new ResourceNotFoundException("El correo electrónico no existe"));

        if (userService.resetPassword(usuario, request.getOtp(), request.getNewPassword())) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Contraseña actualizada con éxito."));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "OTP inválido o expirado."));
    }

    // Login con JWT
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            throw new IllegalArgumentException ("Email y la contraseña son requeridos");
        }

        Usuario usuario = usuarioRepository.findByCorreoElectronico(email)
                .orElseThrow(()-> new ResourceNotFoundException("El email no existe"));

        Map<String, Object> response = new HashMap<>();

        if (!usuario.getIsAccountVerified()) {
            response.put("success", false);
            response.put("message", "Debes verificar tu cuenta antes de ingresar.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        if (userService.checkPassword(password, usuario.getPassword())) {
            String token = jwtUtil.generateToken(usuario);

            Map<String, Object> userData = Map.of(
                    "id", usuario.getIdUsuario(),
                    "nombre", usuario.getNombreUsuario(),
                    "email", usuario.getCorreoElectronico(),
                    "rol", usuario.getRol().getIdRol()
            );

            response.put("success", true);
            response.put("message", "Usuario autenticado");
            response.put("data", userData);
            response.put("token", token);

            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Contraseña incorrecta");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
