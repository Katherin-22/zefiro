// ComentarioProductoService.java
package com.backend.proyect.service.comentario;

import com.backend.proyect.dto.comentario.ComentarioRequestDTO;
import com.backend.proyect.dto.comentario.ComentarioResponseDTO;
import com.backend.proyect.model.comentario.ComentarioProducto;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.comentario.ComentarioProductoRepository;
import com.backend.proyect.repository.productos.ProductoRepository;
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
    
    // Crear nuevo comentario
    @Transactional
    public ComentarioResponseDTO crearComentario(Integer idUsuario, ComentarioRequestDTO requestDTO) {
        // Verificar si el producto existe
        Producto producto = productoRepository.findById(requestDTO.getIdProducto())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Verificar si el usuario existe
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar si el usuario ya comentó este producto
        if (comentarioRepository.existsByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, requestDTO.getIdProducto())) {
            throw new RuntimeException("Ya has comentado este producto anteriormente");
        }
        
        // Crear nuevo comentario
        ComentarioProducto comentario = new ComentarioProducto();
        comentario.setProducto(producto);
        comentario.setUsuario(usuario);
        comentario.setComentario(requestDTO.getComentario());
        comentario.setCalificacion(requestDTO.getCalificacion());
        comentario.setFechaComentario(LocalDateTime.now());
        
        ComentarioProducto savedComentario = comentarioRepository.save(comentario);
        
        return convertirADTO(savedComentario);
    }
    
    // Obtener comentarios de un producto
    public List<ComentarioResponseDTO> obtenerComentariosPorProducto(Integer idProducto) {
        List<ComentarioProducto> comentarios = comentarioRepository
            .findByProductoIdProductoAndEstadoOrderByFechaComentarioDesc(
                idProducto, ComentarioProducto.EstadoComentario.Activo);
        
        Double promedio = comentarioRepository.calcularPromedioCalificacion(idProducto);
        Long total = comentarioRepository.contarComentariosActivos(idProducto);
        
        return comentarios.stream()
            .map(comentario -> {
                ComentarioResponseDTO dto = convertirADTO(comentario);
                dto.setPromedioCalificacion(promedio);
                dto.setTotalComentarios(total);
                return dto;
            })
            .collect(Collectors.toList());
    }
    
    // Obtener comentario específico de usuario
    public ComentarioResponseDTO obtenerComentarioUsuario(Integer idUsuario, Integer idProducto) {
        ComentarioProducto comentario = comentarioRepository
            .findByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, idProducto)
            .orElse(null);
        
        if (comentario != null && comentario.getEstado() == ComentarioProducto.EstadoComentario.Activo) {
            return convertirADTO(comentario);
        }
        
        return null;
    }
    
    // Actualizar comentario
    @Transactional
    public ComentarioResponseDTO actualizarComentario(Integer idComentario, Integer idUsuario, String nuevoComentario, Integer nuevaCalificacion) {
        ComentarioProducto comentario = comentarioRepository.findById(idComentario)
            .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));
        
        // Verificar que el comentario pertenece al usuario
        if (!comentario.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para modificar este comentario");
        }
        
        comentario.setComentario(nuevoComentario);
        comentario.setCalificacion(nuevaCalificacion);
        comentario.setFechaComentario(LocalDateTime.now());
        
        ComentarioProducto updatedComentario = comentarioRepository.save(comentario);
        return convertirADTO(updatedComentario);
    }
    
    // Eliminar comentario (marcar como eliminado)
    @Transactional
    public void eliminarComentario(Integer idComentario, Integer idUsuario) {
        ComentarioProducto comentario = comentarioRepository.findById(idComentario)
            .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));
        
        // Verificar que el comentario pertenece al usuario
        if (!comentario.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para eliminar este comentario");
        }
        
        comentario.setEstado(ComentarioProducto.EstadoComentario.Eliminado);
        comentarioRepository.save(comentario);
    }
    
    // Obtener estadísticas del producto
    public ComentarioResponseDTO obtenerEstadisticasProducto(Integer idProducto) {
        Double promedio = comentarioRepository.calcularPromedioCalificacion(idProducto);
        Long total = comentarioRepository.contarComentariosActivos(idProducto);
        
        ComentarioResponseDTO dto = new ComentarioResponseDTO();
        dto.setIdProducto(idProducto);
        dto.setPromedioCalificacion(promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0);
        dto.setTotalComentarios(total);
        
        return dto;
    }
    
    // Método privado para convertir entidad a DTO
    private ComentarioResponseDTO convertirADTO(ComentarioProducto comentario) {
        ComentarioResponseDTO dto = new ComentarioResponseDTO();
        dto.setIdComentario(comentario.getIdComentario());
        dto.setIdProducto(comentario.getProducto().getIdProducto());
        dto.setIdUsuario(comentario.getUsuario().getIdUsuario());
        dto.setNombreUsuario(comentario.getUsuario().getNombreUsuario());
        dto.setComentario(comentario.getComentario());
        dto.setCalificacion(comentario.getCalificacion());
        dto.setFechaComentario(comentario.getFechaComentario());
        dto.setEstado(comentario.getEstado().toString());
        return dto;
    }
}