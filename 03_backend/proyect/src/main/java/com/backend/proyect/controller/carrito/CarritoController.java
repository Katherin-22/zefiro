package com.backend.proyect.controller.carrito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.proyect.dto.carrito.CarritoDTO;
import com.backend.proyect.exception.productos.ResourceNotFoundException;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.carrito.CarritoRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;


@RestController

public class CarritoController {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;    

    //@PreAuthorize("hasAuthority('ROLE_ADMINISTRADOR')")
    @PostMapping("/carrito/{idUsuario}")
    ResponseEntity<Carrito> newCarrito(@RequestBody CarritoDTO carritoDTO, @PathVariable Integer idUsuario) {
    // Convertir el DTO a entidad Carrito
    Carrito carrito = new Carrito();

    Usuario usuario = usuarioRepository.findById(idUsuario)
        .orElseThrow(()->new ResourceNotFoundException("Usuario",idUsuario));    
    
    carrito.setTotal(carritoDTO.getTotal());
    carrito.setFechaCreacion(carritoDTO.getFechaCreacion());
    carrito.setUsuario(usuario);

    // Guardar en BD
    Carrito saved = carritoRepository.save(carrito);

    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
}

    @GetMapping("/carrito/{idUsuario}")
    public ResponseEntity<Carrito> getCarritoByUsuario(@PathVariable Integer idUsuario) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", idUsuario));

        Carrito carrito = carritoRepository.findByUsuario_IdUsuario(idUsuario)
            .orElseThrow(() -> new ResourceNotFoundException("Carrito", idUsuario));

        return ResponseEntity.ok(carrito);
    }

}
