package com.backend.proyect.repository.devoluciones;

import com.backend.proyect.dto.devoluciones.DevolucionResumen;
import com.backend.proyect.model.devoluciones.DevolucionesCambios;
import com.backend.proyect.model.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface  DevolucionesCambiosRepository extends JpaRepository<DevolucionesCambios, Integer> {
    List<DevolucionResumen> findByUsuario(Usuario usuario);

    List<DevolucionResumen> findAllProjectedBy();

    @Query("SELECT d FROM DevolucionesCambios d WHERE d.id_devolucion = :id")
    Optional<DevolucionResumen> findResumenById(Integer id);
}
