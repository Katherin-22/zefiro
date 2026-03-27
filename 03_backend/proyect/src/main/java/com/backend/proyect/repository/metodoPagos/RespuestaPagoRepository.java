package com.backend.proyect.repository.metodoPagos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.proyect.model.metodoPagos.RespuestaPago;

@Repository
public interface RespuestaPagoRepository extends JpaRepository<RespuestaPago, String> {

}
