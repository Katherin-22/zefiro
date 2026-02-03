// ComentarioProductoController.java
package com.backend.proyect.controller.comentario;

import com.backend.proyect.dto.comentario.ComentarioRequestDTO;
import com.backend.proyect.dto.comentario.ComentarioResponseDTO;
import com.backend.proyect.service.comentario.ComentarioProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class ComentarioProductoController {
    
    @Autowired
    private ComentarioProductoService comentarioService;
    
    // Crear nuevo comentario
    @PostMapping("/crear")
    public ResponseEntity<?> crearComentario(
            @RequestHeader("idUsuario") Integer idUsuario,
            @Valid @RequestBody ComentarioRequestDTO requestDTO) {
        try {
            ComentarioResponseDTO comentario = comentarioService.crearComentario(idUsuario, requestDTO);
            return ResponseEntity.ok(comentario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Obtener comentarios de un producto
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<ComentarioResponseDTO>> obtenerComentariosProducto(
            @PathVariable Integer idProducto) {
        List<ComentarioResponseDTO> comentarios = comentarioService.obtenerComentariosPorProducto(idProducto);
        return ResponseEntity.ok(comentarios);
    }
    
    // Obtener comentario del usuario actual para un producto
    @GetMapping("/producto/{idProducto}/usuario")
    public ResponseEntity<ComentarioResponseDTO> obtenerComentarioUsuario(
            @RequestHeader("idUsuario") Integer idUsuario,
            @PathVariable Integer idProducto) {
        ComentarioResponseDTO comentario = comentarioService.obtenerComentarioUsuario(idUsuario, idProducto);
        if (comentario != null) {
            return ResponseEntity.ok(comentario);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Actualizar comentario
    @PutMapping("/{idComentario}")
    public ResponseEntity<?> actualizarComentario(
            @PathVariable Integer idComentario,
            @RequestHeader("idUsuario") Integer idUsuario,
            @RequestParam String comentario,
            @RequestParam Integer calificacion) {
        try {
            ComentarioResponseDTO updated = comentarioService.actualizarComentario(
                idComentario, idUsuario, comentario, calificacion);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Eliminar comentario
    @DeleteMapping("/{idComentario}")
    public ResponseEntity<?> eliminarComentario(
            @PathVariable Integer idComentario,
            @RequestHeader("idUsuario") Integer idUsuario) {
        try {
            comentarioService.eliminarComentario(idComentario, idUsuario);
            return ResponseEntity.ok("Comentario eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Obtener estadísticas del producto
    @GetMapping("/producto/{idProducto}/estadisticas")
    public ResponseEntity<ComentarioResponseDTO> obtenerEstadisticasProducto(
            @PathVariable Integer idProducto) {
        ComentarioResponseDTO estadisticas = comentarioService.obtenerEstadisticasProducto(idProducto);
        return ResponseEntity.ok(estadisticas);
    }
}