package com.backend.proyect.controller.favorito;

import com.backend.proyect.dto.favorito.AgregarFavoritoRequest;
import com.backend.proyect.dto.favorito.FavoritoDTO;
import com.backend.proyect.dto.favorito.ProductoFavoritoDTO;
import com.backend.proyect.service.favorito.FavoritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@Tag(name = "Favoritos", description = "API para gestión de productos favoritos")
public class FavoritoController {
    
    private final FavoritoService favoritoService;
    
    @PostMapping("/usuario/{idUsuario}/agregar")
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Agregar producto a favoritos")
    public ResponseEntity<FavoritoDTO> agregarAFavoritos(
            @PathVariable Integer idUsuario,
            @RequestBody AgregarFavoritoRequest request) {
        
        FavoritoDTO favoritoDTO = favoritoService.agregarFavorito(idUsuario, request);
        return new ResponseEntity<>(favoritoDTO, HttpStatus.CREATED);
    }
    
    @DeleteMapping("/usuario/{idUsuario}/producto/{idProducto}")
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Eliminar producto de favoritos")
    public ResponseEntity<Void> eliminarDeFavoritos(
            @PathVariable Integer idUsuario,
            @PathVariable Integer idProducto) {
        
        favoritoService.eliminarFavorito(idUsuario, idProducto);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR')")
    @Operation(summary = "Obtener todos los favoritos de un usuario")
    public ResponseEntity<List<FavoritoDTO>> obtenerFavoritosUsuario(
            @PathVariable Integer idUsuario) {
        
        List<FavoritoDTO> favoritos = favoritoService.obtenerFavoritosPorUsuario(idUsuario);
        return ResponseEntity.ok(favoritos);
    }
    
    @GetMapping("/usuario/{idUsuario}/productos")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR')")
    @Operation(summary = "Obtener productos favoritos con detalles")
    public ResponseEntity<List<ProductoFavoritoDTO>> obtenerProductosFavoritos(
            @PathVariable Integer idUsuario) {
        
        List<ProductoFavoritoDTO> productos = favoritoService.obtenerProductosFavoritos(idUsuario);
        return ResponseEntity.ok(productos);
    }
    
    @GetMapping("/usuario/{idUsuario}/verificar/{idProducto}")
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Verificar si un producto está en favoritos")
    public ResponseEntity<Boolean> verificarProductoEnFavoritos(
            @PathVariable Integer idUsuario,
            @PathVariable Integer idProducto) {
        
        Boolean estaEnFavoritos = favoritoService.verificarProductoEnFavoritos(idUsuario, idProducto);
        return ResponseEntity.ok(estaEnFavoritos);
    }
    
    @GetMapping("/usuario/{idUsuario}/contar")
    @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMINISTRADOR')")
    @Operation(summary = "Contar favoritos de un usuario")
    public ResponseEntity<Long> contarFavoritosUsuario(
            @PathVariable Integer idUsuario) {
        
        Long cantidad = favoritoService.contarFavoritosPorUsuario(idUsuario);
        return ResponseEntity.ok(cantidad);
    }
    
    @DeleteMapping("/usuario/{idUsuario}/todos")
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Eliminar todos los favoritos de un usuario")
    public ResponseEntity<Void> eliminarTodosFavoritos(
            @PathVariable Integer idUsuario) {
        
        favoritoService.eliminarTodosFavoritos(idUsuario);
        return ResponseEntity.noContent().build();
    }
}