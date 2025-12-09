package com.backend.proyect.controller.carrito;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.proyect.dto.carrito.DetalleCarritoDTO;
import com.backend.proyect.exception.productos.ResourceNotFoundException;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.carrito.DetalleCarrito;
import com.backend.proyect.model.productos.Stock;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.carrito.CarritoRepository;
import com.backend.proyect.repository.carrito.DetalleCarritoRepository;
import com.backend.proyect.repository.productos.StockRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;


@RestController

public class DetalleCarritoController {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private DetalleCarritoRepository detalleCarritoRepository;    
    
    @Autowired
    private UsuarioRepository usuarioRepository;      
  
    @Autowired
    private StockRepository stockRepository;       

    //@PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    @PostMapping("/carrito/{idUsuario}/{idCarrito}")
    ResponseEntity<DetalleCarrito> newDetalleCarrito(@RequestBody DetalleCarritoDTO detalleCarritoDTO, @PathVariable Integer idUsuario, @PathVariable Integer idCarrito) {
    // Convertir el DTO a entidad Carrito
    DetalleCarrito detalleCarrito = new DetalleCarrito();

    Usuario usuario = usuarioRepository.findById(idUsuario)
        .orElseThrow(()->new ResourceNotFoundException("Usuario",idUsuario));   
        
    Stock stock = stockRepository.findById(detalleCarritoDTO.getIdStock())
        .orElseThrow(()->new ResourceNotFoundException("Stock",detalleCarritoDTO.getIdStock()));
        
    Carrito carrito = carritoRepository.findById(detalleCarritoDTO.getIdCarrito())
        .orElseThrow(()->new ResourceNotFoundException("Carrito",detalleCarritoDTO.getIdCarrito()));    
    
    detalleCarrito.setPrecioUnitario(detalleCarritoDTO.getPrecioUnitario());
    detalleCarrito.setCantidad(detalleCarritoDTO.getCantidad());
    detalleCarrito.setDescuentoProd(detalleCarritoDTO.getDescuentoProd());
    detalleCarrito.setSubtotal(detalleCarritoDTO.getSubtotal());
    //detalleCarrito.setNombreProducto(detalleCarritoDTO.getStock().getProducto().getNombreProducto());
    //detalleCarrito.setUrlImagen(detalleCarritoDTO.getStock().getProducto().getImagen().getUrlImagen());
    //detalleCarrito.setPrecio(detalleCarritoDTO.getStock().getProducto().getPrecio());
    //detalleCarrito.setNombre(detalleCarritoDTO.getStock().getProducto().getVariacion().getNombre());
    //detalleCarrito.setNombreColor(detalleCarritoDTO.getStock().getProducto().getColor().getNombreColor());
    detalleCarrito.setCarrito(carrito);
    detalleCarrito.setStock(stock);

    // Guardar en BD
    DetalleCarrito saved = detalleCarritoRepository.save(detalleCarrito);

    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
}

@GetMapping("/carrito/{idUsuario}/{idCarrito}")
ResponseEntity<List<DetalleCarritoDTO>> getCarritoByUsuario(@PathVariable Integer idUsuario, @PathVariable Integer idCarrito) {

    List<DetalleCarritoDTO> lista = detalleCarritoRepository
    .findByCarritoIdCarrito(idCarrito).stream().map(detalleCarrito -> {

        DetalleCarritoDTO dto = new DetalleCarritoDTO();

        dto.setPrecioUnitario(detalleCarrito.getPrecioUnitario());
        dto.setCantidad(detalleCarrito.getCantidad());
        dto.setDescuentoProd(detalleCarrito.getDescuentoProd());
        dto.setSubtotal(detalleCarrito.getSubtotal());
        dto.setNombreProducto(detalleCarrito.getStock().getProducto().getNombreProducto());
        //dto.setUrlImagen(detalleCarrito.getStock().getProducto().getImagen().get(0).getUrlImagen());
        dto.setPrecio(detalleCarrito.getStock().getProducto().getPrecio());
        dto.setNombre(detalleCarrito.getStock().getVariacion().getNombre());
        dto.setNombreColor(detalleCarrito.getStock().getColor().getNombreColor());

        return dto;
    }).toList();

    return ResponseEntity.ok(lista);

}
}
