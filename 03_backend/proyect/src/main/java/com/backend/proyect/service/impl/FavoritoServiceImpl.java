package com.backend.proyect.service.impl;

import com.backend.proyect.dto.favorito.AgregarFavoritoRequest;
import com.backend.proyect.dto.favorito.FavoritoDTO;
import com.backend.proyect.dto.favorito.ProductoFavoritoDTO;
import com.backend.proyect.exception.favorito.ResourceNotFoundException;
import com.backend.proyect.model.favoritos.favorito; // ¡Con f minúscula!
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.favorito.FavoritoRepository;
import com.backend.proyect.repository.productos.ProductoRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.service.favorito.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoritoServiceImpl implements FavoritoService {
    
    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    
    @Override
    @Transactional
    public FavoritoDTO agregarFavorito(Integer idUsuario, AgregarFavoritoRequest request) {
        // Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + idUsuario));
        
        // Verificar que el producto existe
        Producto producto = productoRepository.findById(request.getIdProducto())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + request.getIdProducto()));
        
        // Verificar si ya está en favoritos
        if (favoritoRepository.existsByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, request.getIdProducto())) {
            throw new IllegalArgumentException("El producto ya está en favoritos");
        }
        
        // Crear y guardar el favorito
        favorito favorito = new favorito(); // Con f minúscula
        favorito.setUsuario(usuario);
        favorito.setProducto(producto);
        
        favorito savedFavorito = favoritoRepository.save(favorito);
        
        return mapToDTO(savedFavorito);
    }
    
    @Override

    @Transactional
    public void eliminarFavorito(Integer idUsuario, Integer idProducto) {
        // Verificar que el favorito existe
        favorito favorito = favoritoRepository
                .findByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, idProducto)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Favorito no encontrado para usuario " + idUsuario + " y producto " + idProducto));
        
        favoritoRepository.delete(favorito);
    }
    
    @Override
    public List<FavoritoDTO> obtenerFavoritosPorUsuario(Integer idUsuario) {
        List<favorito> favoritos = favoritoRepository.findByUsuarioIdUsuario(idUsuario);
        return favoritos.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductoFavoritoDTO> obtenerProductosFavoritos(Integer idUsuario) {
        List<favorito> favoritos = favoritoRepository.findByUsuarioIdUsuario(idUsuario);
        
        return favoritos.stream()
                .map(favorito -> {
                    Producto producto = favorito.getProducto();
                    ProductoFavoritoDTO dto = new ProductoFavoritoDTO();
                    dto.setIdProducto(producto.getIdProducto());
                    dto.setNombreProducto(producto.getNombreProducto());
                    dto.setDescripcion(producto.getDescripcion());
                    dto.setPrecio(producto.getPrecio());
                    
                    // Aquí puedes agregar más información si es necesario
                    // Por ejemplo: categoría, marca, imágenes, etc.
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public Boolean verificarProductoEnFavoritos(Integer idUsuario, Integer idProducto) {
        return favoritoRepository.existsByUsuarioIdUsuarioAndProductoIdProducto(idUsuario, idProducto);
    }
    
    @Override
    public Long contarFavoritosPorUsuario(Integer idUsuario) {
        return favoritoRepository.countByUsuarioIdUsuario(idUsuario);
    }
    
@Override
@Transactional
public void eliminarTodosFavoritos(Integer idUsuario) {
    // Opcional: Verificar que el usuario existe
    if (!usuarioRepository.existsById(idUsuario)) {
        throw new ResourceNotFoundException("Usuario no encontrado con id: " + idUsuario);
    }
    
    favoritoRepository.deleteByUsuarioIdUsuario(idUsuario);
}
    
    private FavoritoDTO mapToDTO(favorito favorito) {
        FavoritoDTO dto = new FavoritoDTO();
        dto.setIdFavorito(favorito.getIdFavorito());
        dto.setIdUsuario(favorito.getUsuario().getIdUsuario());
        dto.setIdProducto(favorito.getProducto().getIdProducto());
        dto.setFechaAgregado(favorito.getFechaAgregado());
        dto.setNombreProducto(favorito.getProducto().getNombreProducto());
        dto.setPrecioProducto(favorito.getProducto().getPrecio());
        
        // Aquí podrías agregar la URL de la imagen principal del producto
        // si tienes acceso al servicio de imágenes
        
        return dto;
    }
}