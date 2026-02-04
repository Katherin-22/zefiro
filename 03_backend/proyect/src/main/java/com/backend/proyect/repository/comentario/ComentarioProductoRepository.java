// ComentarioProductoRepository.java
package com.backend.proyect.repository.comentario;

import com.backend.proyect.model.comentario.ComentarioProducto;
import com.backend.proyect.model.comentario.ComentarioProducto.EstadoComentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComentarioProductoRepository extends JpaRepository<ComentarioProducto, Integer> {
    
    // Encontrar todos los comentarios activos de un producto
    List<ComentarioProducto> findByProductoIdProductoAndEstadoOrderByFechaComentarioDesc(
        Integer idProducto, EstadoComentario estado);
    
    // Encontrar comentario específico de un usuario para un producto
    Optional<ComentarioProducto> findByUsuarioIdUsuarioAndProductoIdProducto(
        Integer idUsuario, Integer idProducto);
    
    // Calcular promedio de calificaciones
    @Query("SELECT AVG(c.calificacion) FROM ComentarioProducto c WHERE c.producto.idProducto = :idProducto AND c.estado = 'Activo'")
    Double calcularPromedioCalificacion(@Param("idProducto") Integer idProducto);
    
    // Contar comentarios activos
    @Query("SELECT COUNT(c) FROM ComentarioProducto c WHERE c.producto.idProducto = :idProducto AND c.estado = 'Activo'")
    Long contarComentariosActivos(@Param("idProducto") Integer idProducto);
    
    // Encontrar comentarios por usuario
    List<ComentarioProducto> findByUsuarioIdUsuarioOrderByFechaComentarioDesc(Integer idUsuario);
    
    // Verificar si usuario ya comentó el producto
    boolean existsByUsuarioIdUsuarioAndProductoIdProducto(Integer idUsuario, Integer idProducto);
}