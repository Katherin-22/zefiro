package com.backend.proyect.controller.devoluciones;

import com.backend.proyect.dto.devoluciones.DevolucionesCambiosRequest;
import com.backend.proyect.exception.usuario.ResourceNotFoundException;
import com.backend.proyect.model.devoluciones.DevolucionesCambios;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.devoluciones.DevolucionesCambiosRepository;
import com.backend.proyect.repository.pedido.pedidoRepository;
import com.backend.proyect.repository.productos.ProductoRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.security.usuario.UsuarioPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devoluciones")
public class DevolucionesCambiosController {

    @Autowired
    private DevolucionesCambiosRepository devolucionesCambiosRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private pedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Formateadores para diferentes formatos de fecha
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Ver todas las devoluciones (SOLO ADMIN)
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<?> listarDevoluciones() {
        try {
            System.out.println("🔍 Listando todas las devoluciones...");
            
            List<DevolucionesCambios> devoluciones = devolucionesCambiosRepository.findAll();
            
            System.out.println("✅ Devoluciones encontradas: " + devoluciones.size());
            
            // Verificar que no haya problemas de serialización
            for (DevolucionesCambios d : devoluciones) {
                if (d.getUsuario() == null) {
                    System.out.println("⚠️ Devolución ID " + d.getId_devolucion() + " no tiene usuario asignado");
                }
                if (d.getProducto() == null) {
                    System.out.println("⚠️ Devolución ID " + d.getId_devolucion() + " no tiene producto asignado");
                }
                if (d.getPedido() == null) {
                    System.out.println("⚠️ Devolución ID " + d.getId_devolucion() + " no tiene pedido asignado");
                }
            }
            
            return ResponseEntity.ok(devoluciones);
            
        } catch (Exception e) {
            System.err.println("❌ Error al listar devoluciones:");
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno al listar devoluciones: " + e.getMessage());
            error.put("tipo", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Ver una devolucion de un usuario por ID
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> listarDevolucionPorId(@PathVariable Integer id) {
        try {
            System.out.println("🔍 Buscando devolución ID: " + id);
            
            DevolucionesCambios devolucionescambios = devolucionesCambiosRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("La devolucion con ese ID no existe: " + id));

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
            Usuario usuarioPrincipal = usuarioPrincipalWrapper.getUsuario();

            boolean isOwner = devolucionescambios.getUsuario().getIdUsuario().equals(usuarioPrincipal.getIdUsuario());
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));

            if (isOwner || isAdmin) {
                return ResponseEntity.ok(devolucionescambios);
            } else {
                throw new AccessDeniedException("No tiene permiso para acceder a esta devolucion.");
            }
            
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (AccessDeniedException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (Exception e) {
            System.err.println("❌ Error al buscar devolución " + id + ":");
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Endpoint para que el Cliente vea todas sus propias devoluciones
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @GetMapping("/mis-devoluciones")
    public ResponseEntity<?> listarMisDevoluciones() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
            Usuario usuarioLogeado = usuarioPrincipalWrapper.getUsuario();

            System.out.println("🔍 Buscando devoluciones para usuario: " + usuarioLogeado.getIdUsuario());

            List<DevolucionesCambios> misDevoluciones = devolucionesCambiosRepository.findByUsuario(usuarioLogeado);
            
            System.out.println("✅ Devoluciones encontradas: " + misDevoluciones.size());
            
            return ResponseEntity.ok(misDevoluciones);
            
        } catch (Exception e) {
            System.err.println("❌ Error al listar mis devoluciones:");
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Método auxiliar para convertir string a LocalDateTime
    private LocalDateTime parseFecha(String fechaStr) {
        if (fechaStr == null || fechaStr.isEmpty()) {
            return null;
        }
        
        try {
            // Intentar con formato fecha+hora
            return LocalDateTime.parse(fechaStr, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e1) {
            try {
                // Intentar solo con fecha (asumiendo inicio del día)
                LocalDate fecha = LocalDate.parse(fechaStr, DATE_FORMATTER);
                return fecha.atStartOfDay();
            } catch (DateTimeParseException e2) {
                throw new DateTimeParseException("Formato de fecha inválido. Use: yyyy-MM-dd o yyyy-MM-dd HH:mm:ss", fechaStr, 0);
            }
        }
    }

    // Crear una devolucion
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @PostMapping
    public ResponseEntity<?> guardarDevolucion(@RequestBody DevolucionesCambiosRequest devolucionesCambiosRequest) {
        
        System.out.println("📝 Creando nueva devolución...");
        System.out.println("Request: " + devolucionesCambiosRequest);
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
            Usuario usuarioPrincipal = usuarioPrincipalWrapper.getUsuario();

            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));

            DevolucionesCambios devolucionescambios = new DevolucionesCambios();

            // Asignar campos básicos
            devolucionescambios.setMotivo(devolucionesCambiosRequest.getMotivo());
            devolucionescambios.setTipoSolicitud(devolucionesCambiosRequest.getTipoSolicitud());
            devolucionescambios.setEstadoSolicitud(devolucionesCambiosRequest.getEstadoSolicitud());

            // Convertir fechas con manejo flexible
            try {
                // Fecha de solicitud
                if (devolucionesCambiosRequest.getFechaSolicitud() != null && !devolucionesCambiosRequest.getFechaSolicitud().isEmpty()) {
                    devolucionescambios.setFechaSolicitud(parseFecha(devolucionesCambiosRequest.getFechaSolicitud()));
                } else {
                    devolucionescambios.setFechaSolicitud(LocalDateTime.now());
                }

                // Fecha de respuesta (si existe)
                if (devolucionesCambiosRequest.getFechaRespuesta() != null && !devolucionesCambiosRequest.getFechaRespuesta().isEmpty()) {
                    devolucionescambios.setFechaRespuesta(parseFecha(devolucionesCambiosRequest.getFechaRespuesta()));
                }
            } catch (DateTimeParseException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", e.getMessage());
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Asignar relaciones
            if (devolucionesCambiosRequest.getIdProducto() != null) {
                devolucionescambios.setProducto(productoRepository.findById(devolucionesCambiosRequest.getIdProducto())
                        .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado")));
            }

            if (devolucionesCambiosRequest.getIdPedido() != null) {
                devolucionescambios.setPedido(pedidoRepository.findById(devolucionesCambiosRequest.getIdPedido())
                        .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado")));
            }

            // Asignar usuario según rol
            if (isAdmin) {
                if (devolucionesCambiosRequest.getIdUsuario() == null) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "El ID de usuario es obligatorio para administradores");
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
                }
                Usuario usuario = usuarioRepository.findById(devolucionesCambiosRequest.getIdUsuario())
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
                devolucionescambios.setUsuario(usuario);
            } else {
                // Cliente: usar el usuario autenticado
                devolucionescambios.setUsuario(usuarioPrincipal);
                devolucionescambios.setEstadoSolicitud("Pendiente");
                devolucionescambios.setFechaRespuesta(null);
            }

            // Guardar en base de datos
            try {
                devolucionesCambiosRepository.save(devolucionescambios);
                System.out.println("✅ Devolución guardada con ID: " + devolucionescambios.getId_devolucion());
            } catch (Exception e) {
                System.err.println("❌ Error al guardar en BD:");
                e.printStackTrace();
                Map<String, String> error = new HashMap<>();
                error.put("error", "Error al guardar la devolución: " + e.getMessage());
                return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "¡Devolución registrada exitosamente!");
            response.put("id", devolucionescambios.getId_devolucion());

            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("❌ Error inesperado:");
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Actualizar devolucion
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDevolucion(@PathVariable Integer id, 
                                                   @RequestBody DevolucionesCambiosRequest devolucionesCambiosRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("📝 Actualizando devolución ID: " + id);
            
            DevolucionesCambios devolucionescambios = devolucionesCambiosRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("La devolucion con ese ID no existe: " + id));

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
            Usuario usuarioPrincipal = usuarioPrincipalWrapper.getUsuario();

            boolean isOwner = devolucionescambios.getUsuario().getIdUsuario().equals(usuarioPrincipal.getIdUsuario());
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));

            if (isAdmin) {
                // Admin puede actualizar todo
                devolucionescambios.setMotivo(devolucionesCambiosRequest.getMotivo());
                devolucionescambios.setTipoSolicitud(devolucionesCambiosRequest.getTipoSolicitud());
                devolucionescambios.setEstadoSolicitud(devolucionesCambiosRequest.getEstadoSolicitud());

                // Convertir fechas
                try {
                    if (devolucionesCambiosRequest.getFechaSolicitud() != null && !devolucionesCambiosRequest.getFechaSolicitud().isEmpty()) {
                        devolucionescambios.setFechaSolicitud(parseFecha(devolucionesCambiosRequest.getFechaSolicitud()));
                    }
                    if (devolucionesCambiosRequest.getFechaRespuesta() != null && !devolucionesCambiosRequest.getFechaRespuesta().isEmpty()) {
                        devolucionescambios.setFechaRespuesta(parseFecha(devolucionesCambiosRequest.getFechaRespuesta()));
                    }
                } catch (DateTimeParseException e) {
                    response.put("error", e.getMessage());
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }

                if (devolucionesCambiosRequest.getIdUsuario() != null) {
                    Usuario usuario = usuarioRepository.findById(devolucionesCambiosRequest.getIdUsuario())
                            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
                    devolucionescambios.setUsuario(usuario);
                }

            } else if (isOwner) {
                // Cliente solo puede actualizar si está Pendiente
                if (!devolucionescambios.getEstadoSolicitud().equalsIgnoreCase("Pendiente")) {
                    throw new AccessDeniedException("No puedes editar una solicitud que ya está en proceso o finalizada.");
                }
                devolucionescambios.setMotivo(devolucionesCambiosRequest.getMotivo());
                devolucionescambios.setTipoSolicitud(devolucionesCambiosRequest.getTipoSolicitud());
                // No actualizar fechas ni estado para clientes
            } else {
                throw new AccessDeniedException("No tiene permiso para actualizar esta devolucion.");
            }

            DevolucionesCambios devolucionActualizada = devolucionesCambiosRepository.save(devolucionescambios);
            System.out.println("✅ Devolución actualizada: " + id);
            return ResponseEntity.ok(devolucionActualizada);
            
        } catch (AccessDeniedException e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        } catch (ResourceNotFoundException e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("❌ Error al actualizar devolución " + id + ":");
            e.printStackTrace();
            response.put("error", "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminar devolucion (solo admin)
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDevolucion(@PathVariable Integer id) {
        try {
            System.out.println("🗑️ Eliminando devolución ID: " + id);
            
            DevolucionesCambios devolucionescambios = devolucionesCambiosRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("La devolucion con ese ID no existe: " + id));

            devolucionesCambiosRepository.delete(devolucionescambios);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);
            System.out.println("✅ Devolución eliminada: " + id);
            return ResponseEntity.ok(response);
            
        } catch (ResourceNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.err.println("❌ Error al eliminar devolución " + id + ":");
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}