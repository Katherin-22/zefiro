package com.backend.proyect.controller.productos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.proyect.exception.productos.ResourceNotFoundException;
import com.backend.proyect.model.productos.TipoPublico;
import com.backend.proyect.repository.productos.TipoPublicoRepository;

@RestController
public class TipoPublicoController {

    @Autowired
    // tipoProductoRepository este se pone en los return
    private TipoPublicoRepository tipoPublicoRepository;

    @GetMapping("/publico/tipo_publicos")
    List<TipoPublico> getAllTipoPublico() {
        return tipoPublicoRepository.findAll();
    }

    @GetMapping("/publico/tipo_publico/{idPublico}")
    TipoPublico getOneTipoPublico(@PathVariable Integer idPublico) {
        return tipoPublicoRepository.findById(idPublico)
                .orElseThrow(() -> new ResourceNotFoundException("TipoPublico", idPublico));
    }

}
