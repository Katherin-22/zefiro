package com.backend.proyect.repository.metodosPago;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.proyect.model.metodosPago.RespuestaPago;

@Repository
public interface RespuestaPagoRepository extends JpaRepository<RespuestaPago, String> {

}
