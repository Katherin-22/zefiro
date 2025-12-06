package com.backend.proyect.repository.favorito;

import com.backend.proyect.model.favoritos.favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<favorito, Integer> {
    
    Optional<favorito> findByUsuarioIdUsuarioAndProductoIdProducto(Integer idUsuario, Integer idProducto);
    
    List<favorito> findByUsuarioIdUsuario(Integer idUsuario);
    
    Long countByUsuarioIdUsuario(Integer idUsuario);
    
    Boolean existsByUsuarioIdUsuarioAndProductoIdProducto(Integer idUsuario, Integer idProducto);
    
    // Este método debe existir:
    void deleteByUsuarioIdUsuario(Integer idUsuario);
    
    // Este también puede ser útil:
    void deleteByUsuarioIdUsuarioAndProductoIdProducto(Integer idUsuario, Integer idProducto);
}