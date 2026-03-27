package com.backend.proyect.service.comentario;

import com.backend.proyect.dto.comentario.ComentarioRequestDTO;
import com.backend.proyect.dto.comentario.ComentarioResponseDTO;
import com.backend.proyect.model.comentario.ComentarioProducto;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.comentario.ComentarioProductoRepository;
import com.backend.proyect.repository.productos.*;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComentarioProductoService {

    @Autowired
    private ComentarioProductoRepository comentarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear comentario
    @Transactional
    public ComentarioResponseDTO crearComentario(Integer idUsuario, ComentarioRequestDTO requestDTO) {
        // Verificar si el usuario ya comentó este producto
        if (comentarioRepository.existsByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, requestDTO.getIdProducto())) {
            throw new RuntimeException("Ya has comentado este producto. Solo puedes comentar una vez.");
        }

        // Obtener usuario y producto
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Producto producto = productoRepository.findById(requestDTO.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Validar calificación
        if (requestDTO.getCalificacion() < 1 || requestDTO.getCalificacion() > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }

        // Crear nuevo comentario
        ComentarioProducto comentario = new ComentarioProducto();
        comentario.setUsuario(usuario);
        comentario.setProducto(producto);
        comentario.setComentario(requestDTO.getComentario());
        comentario.setCalificacion(requestDTO.getCalificacion());
        comentario.setFechaComentario(LocalDateTime.now());
        comentario.setEstado(ComentarioProducto.EstadoComentario.Activo);

        // Guardar
        ComentarioProducto saved = comentarioRepository.save(comentario);

        // Obtener estadísticas actualizadas
        Double promedio = comentarioRepository.calcularPromedioCalificacion(producto.getIdProducto());
        Long total = comentarioRepository.contarComentariosActivos(producto.getIdProducto());

        // Convertir a DTO
        return convertirADTO(saved, promedio, total);
    }

    // Obtener comentarios de un producto
    public List<ComentarioResponseDTO> obtenerComentariosPorProducto(Integer idProducto) {
        List<ComentarioProducto> comentarios = comentarioRepository
                .findByProductoIdProductoAndEstadoOrderByFechaComentarioDesc(
                        idProducto, ComentarioProducto.EstadoComentario.Activo);

        // Calcular estadísticas una sola vez
        Double promedio = comentarioRepository.calcularPromedioCalificacion(idProducto);
        Long total = comentarioRepository.contarComentariosActivos(idProducto);

        return comentarios.stream()
                .map(c -> convertirADTO(c, promedio, total))
                .collect(Collectors.toList());
    }

    // Obtener comentario específico del usuario
    public ComentarioResponseDTO obtenerComentarioUsuario(Integer idUsuario, Integer idProducto) {
        // Calcular estadísticas primero
        Double promedio = comentarioRepository.calcularPromedioCalificacion(idProducto);
        Long total = comentarioRepository.contarComentariosActivos(idProducto);

        return comentarioRepository.findByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, idProducto)
                .map(c -> convertirADTO(c, promedio, total))
                .orElse(null);
    }

    // Actualizar comentario
    @Transactional
    public ComentarioResponseDTO actualizarComentario(
            Integer idComentario, Integer idUsuario, String nuevoComentario, Integer nuevaCalificacion) {

        ComentarioProducto comentario = comentarioRepository.findById(idComentario)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        // Verificar que el usuario es el dueño del comentario
        if (!comentario.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para modificar este comentario");
        }

        // Validar calificación
        if (nuevaCalificacion < 1 || nuevaCalificacion > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }

        // Actualizar
        comentario.setComentario(nuevoComentario);
        comentario.setCalificacion(nuevaCalificacion);
        comentario.setFechaComentario(LocalDateTime.now());

        ComentarioProducto updated = comentarioRepository.save(comentario);

        // Obtener estadísticas
        Double promedio = comentarioRepository.calcularPromedioCalificacion(comentario.getProducto().getIdProducto());
        Long total = comentarioRepository.contarComentariosActivos(comentario.getProducto().getIdProducto());

        return convertirADTO(updated, promedio, total);
    }

    // Eliminar comentario (marcar como eliminado)
    @Transactional
    public void eliminarComentario(Integer idComentario, Integer idUsuario) {
        ComentarioProducto comentario = comentarioRepository.findById(idComentario)
                .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

        // Verificar que el usuario es el dueño
        if (!comentario.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para eliminar este comentario");
        }

        // Marcar como eliminado
        comentario.setEstado(ComentarioProducto.EstadoComentario.Eliminado);
        comentarioRepository.save(comentario);
    }

    // Obtener estadísticas del producto
    public ComentarioResponseDTO obtenerEstadisticasProducto(Integer idProducto) {
        Double promedio = comentarioRepository.calcularPromedioCalificacion(idProducto);
        Long total = comentarioRepository.contarComentariosActivos(idProducto);

        ComentarioResponseDTO dto = new ComentarioResponseDTO();
        dto.setIdProducto(idProducto);
        dto.setPromedioCalificacion(promedio != null ? promedio : 0.0);
        dto.setTotalComentarios(total != null ? total : 0L);

        return dto;
    }

    // Método privado para convertir a DTO
    private ComentarioResponseDTO convertirADTO(ComentarioProducto comentario, Double promedio, Long total) {
        ComentarioResponseDTO dto = new ComentarioResponseDTO();
        dto.setIdComentario(comentario.getIdComentario());
        dto.setIdProducto(comentario.getProducto().getIdProducto());
        dto.setIdUsuario(comentario.getUsuario().getIdUsuario());

        // CORREGIDO: Usar los campos correctos de la entidad Usuario
        Usuario usuario = comentario.getUsuario();
        String nombreCompleto = usuario.getNombreUsuario();

        if (usuario.getPrimerApellido() != null && !usuario.getPrimerApellido().trim().isEmpty()) {
            nombreCompleto += " " + usuario.getPrimerApellido();
            if (usuario.getSegundoApellido() != null && !usuario.getSegundoApellido().trim().isEmpty()) {
                nombreCompleto += " " + usuario.getSegundoApellido();
            }
        }
        dto.setNombreUsuario(nombreCompleto);

        dto.setComentario(comentario.getComentario());
        dto.setCalificacion(comentario.getCalificacion());
        dto.setFechaComentario(comentario.getFechaComentario());
        dto.setEstado(comentario.getEstado().toString());
        dto.setPromedioCalificacion(promedio != null ? promedio : 0.0);
        dto.setTotalComentarios(total != null ? total : 0L);

        return dto;
    }
}