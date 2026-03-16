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


    // Ver todas las devoluciones
    // El administrador puede ver  todas las devoluciones
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    @GetMapping
    public List<DevolucionesCambios> listarDevoluciones() {
        return devolucionesCambiosRepository.findAll();
    }

    // Ver  una devolucion de un usuario por ID
    // El administrador puede ver cualquier devolucion por ID.
    // Un cliente solo puede ver su propia devolucion
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @GetMapping("/{id}")
    public ResponseEntity<DevolucionesCambios> listarDevolucionPorId(@PathVariable Integer id) {
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
    }

    // Endpoint para que el Cliente vea todas sus propias devoluciones.
    // GET /api/devoluciones/mis-devoluciones

    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @GetMapping("/mis-devoluciones")
    public ResponseEntity<List<DevolucionesCambios>> listarMisDevoluciones() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();


        UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
        Usuario usuarioLogeado = usuarioPrincipalWrapper.getUsuario();

        // Usar el nuevo método del repository (findByUsuario)
        List<DevolucionesCambios> misDevoluciones = devolucionesCambiosRepository.findByUsuario(usuarioLogeado);

        return ResponseEntity.ok(misDevoluciones);
    }

    // Crear una devolucion
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @PostMapping
    public ResponseEntity<?> guardarDevolucion(@RequestBody DevolucionesCambiosRequest devolucionesCambiosRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
        Usuario usuarioPrincipal = usuarioPrincipalWrapper.getUsuario();

        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));


        DevolucionesCambios devolucionescambios =  new DevolucionesCambios();

        devolucionescambios.setMotivo(devolucionesCambiosRequest.getMotivo());
        devolucionescambios.setTipoSolicitud(devolucionesCambiosRequest.getTipoSolicitud());
        devolucionescambios.setEstadoSolicitud(devolucionesCambiosRequest.getEstadoSolicitud());
        devolucionescambios.setFechaSolicitud(devolucionesCambiosRequest.getFechaSolicitud());
        devolucionescambios.setFechaRespuesta(devolucionesCambiosRequest.getFechaRespuesta());

        if (devolucionesCambiosRequest.getIdProducto() != null) {
            devolucionescambios.setProducto(productoRepository.findById(devolucionesCambiosRequest.getIdProducto())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado")));
        }

        if (devolucionesCambiosRequest.getIdPedido() != null) {
            devolucionescambios.setPedido(pedidoRepository.findById(devolucionesCambiosRequest.getIdPedido())
                    .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado")));
        }

        if (isAdmin) {
            // 🔹 Cargar las tablas con el id
            Usuario usuario = usuarioRepository.findById(devolucionesCambiosRequest.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            devolucionescambios.setUsuario(usuario);
            devolucionescambios.setEstadoSolicitud(devolucionesCambiosRequest.getEstadoSolicitud());
            devolucionescambios.setFechaRespuesta(devolucionesCambiosRequest.getFechaRespuesta());

        }else {

            devolucionescambios.setUsuario(usuarioPrincipal);
            devolucionescambios.setEstadoSolicitud("Pendiente");
            devolucionescambios.setFechaRespuesta(null);
        }

        devolucionesCambiosRepository.save(devolucionescambios);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "¡Devolución registrada exitosamente!");
        response.put("id", devolucionescambios.getId_devolucion());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Actualizar devolucion
    // Un cliente solo puede actualizar su propia devolucion.
    // El administrador puede actualizar cualquier devolucion.
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR') or hasAuthority('ROLE_CLIENTE')")
    @PutMapping("/{id}")
    public ResponseEntity<DevolucionesCambios> actualizarDevolucion(@PathVariable Integer id, @RequestBody DevolucionesCambiosRequest devolucionesCambiosRequest) {
        DevolucionesCambios devolucionescambios = devolucionesCambiosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La devolucion con ese ID no existe: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UsuarioPrincipal usuarioPrincipalWrapper = (UsuarioPrincipal) authentication.getPrincipal();
        Usuario usuarioPrincipal = usuarioPrincipalWrapper.getUsuario();

        boolean isOwner = devolucionescambios.getUsuario().getIdUsuario().equals(usuarioPrincipal.getIdUsuario());


        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));

        if (isAdmin) {

            devolucionescambios.setMotivo(devolucionesCambiosRequest.getMotivo());
            devolucionescambios.setTipoSolicitud(devolucionesCambiosRequest.getTipoSolicitud());
            devolucionescambios.setEstadoSolicitud(devolucionesCambiosRequest.getEstadoSolicitud());
            devolucionescambios.setFechaSolicitud(devolucionesCambiosRequest.getFechaSolicitud());
            devolucionescambios.setFechaRespuesta(devolucionesCambiosRequest.getFechaRespuesta());

            // 🔹 Cargar de nuevo las relaciones
            if (devolucionesCambiosRequest.getIdUsuario() != null) {
                Usuario usuario = usuarioRepository.findById(devolucionesCambiosRequest.getIdUsuario())
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
                devolucionescambios.setUsuario(usuario);
            }
        } else if (isOwner) {

            if (!devolucionescambios.getEstadoSolicitud().equalsIgnoreCase("Pendiente")) {
                throw new AccessDeniedException("No puedes editar una solicitud que ya está en proceso o finalizada.");
            }
            devolucionescambios.setMotivo(devolucionesCambiosRequest.getMotivo());
            devolucionescambios.setTipoSolicitud(devolucionesCambiosRequest.getTipoSolicitud());
            
        } else {
            // 7. Lanzar Acceso Denegado si la verificación falla
            throw new AccessDeniedException("No tiene permiso para actualizar esta devolucion. Solo puede actualizar sus propias devoluciones.");
        }

        DevolucionesCambios devolucionActualizada = devolucionesCambiosRepository.save(devolucionescambios);
        return ResponseEntity.ok(devolucionActualizada);
    }

    // Eliminar devolucion
    // Solo el administrador puede eliminar devoluciones
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String,Boolean>> eliminarDevolucion(@PathVariable Integer id) {
        DevolucionesCambios devolucionescambios = devolucionesCambiosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La devolucion con ese ID no existe: " + id));

        devolucionesCambiosRepository.delete(devolucionescambios);
        Map<String,Boolean> response = new HashMap<>();
        response.put("deleted",Boolean.TRUE);
        return ResponseEntity.ok(response);
    }
}
