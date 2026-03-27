package com.backend.proyect.controller.productos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;

import com.backend.proyect.exception.productos.ResourceNotFoundException;
import com.backend.proyect.model.productos.TipoProducto;
import com.backend.proyect.repository.productos.TipoProductoRepository;

@RestController
public class TipoProductoController {

    @Autowired
    // tipoProductoRepository este se pone en los return
    private TipoProductoRepository tipoProductoRepository;

    @GetMapping("/publico/tipo_productos")
    List<TipoProducto> getAllTipoProducto() {
        return tipoProductoRepository.findAll();
    }

    @GetMapping("/publico/tipo_producto/{idTipoProducto}")
    TipoProducto getOneTipoProducto(@PathVariable Integer idTipoProducto) {
        return tipoProductoRepository.findById(idTipoProducto)
                .orElseThrow(() -> new ResourceNotFoundException("TipoProducto", idTipoProducto));
    }

}
