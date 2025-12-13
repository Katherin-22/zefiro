package com.backend.proyect.repository.metodosPago;

import com.backend.proyect.model.metodosPago.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {

}
