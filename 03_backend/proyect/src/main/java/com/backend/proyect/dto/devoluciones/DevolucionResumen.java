package com.backend.proyect.dto.devoluciones;

import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDate;

public interface DevolucionResumen {
    Integer getId_devolucion();
    String getMotivo();
    String getTipoSolicitud();
    String getEstadoSolicitud();
    String getFechaSolicitud();
    String getFechaRespuesta();

    // Obtenemos solo el ID del usuario para validaciones de seguridad
    @Value("#{target.usuario.idUsuario}")
    Integer getIdUsuario();

    // Traemos el nombre
    @Value("#{target.usuario.nombreUsuario}")
    String getNombreUsuario();

    //  Traemos también el apellido
    @Value("#{target.usuario.primerApellido}")
    String getPrimerApellido();

    // Accedemos a datos específicos de relaciones para romper la recursión
    @Value("#{target.pedido.idPedido}")
    Integer getIdPedido();

    @Value("#{target.producto.nombreProducto}")
    String getNombreProducto();
}