package com.backend.proyect.repository.metodoPagos;

import com.backend.proyect.model.metodoPagos.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {

}
