package com.backend.proyect.service.favorito;

import com.backend.proyect.dto.favorito.AgregarFavoritoRequest;
import com.backend.proyect.dto.favorito.FavoritoDTO;
import com.backend.proyect.dto.favorito.ProductoFavoritoDTO;
import java.util.List;

public interface FavoritoService {
    
    // Agregar producto a favoritos
    FavoritoDTO agregarFavorito(Integer idUsuario, AgregarFavoritoRequest request);
    
    // Eliminar producto de favoritos
    void eliminarFavorito(Integer idUsuario, Integer idProducto);
    
    // Obtener todos los favoritos de un usuario
    List<FavoritoDTO> obtenerFavoritosPorUsuario(Integer idUsuario);
    
    // Obtener productos favoritos con detalles completos
    List<ProductoFavoritoDTO> obtenerProductosFavoritos(Integer idUsuario);
    
    // Verificar si un producto está en favoritos
    Boolean verificarProductoEnFavoritos(Integer idUsuario, Integer idProducto);
    
    // Contar favoritos de un usuario
    Long contarFavoritosPorUsuario(Integer idUsuario);
    
    // Eliminar todos los favoritos de un usuario
    void eliminarTodosFavoritos(Integer idUsuario);
}