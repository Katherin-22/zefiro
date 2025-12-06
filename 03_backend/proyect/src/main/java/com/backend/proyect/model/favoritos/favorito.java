package com.backend.proyect.model.favoritos;

import jakarta.persistence.*; // ¡CAMBIO IMPORTANTE!
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.model.productos.Producto;

@Entity
@Table(name = "Favoritos",
       uniqueConstraints = @UniqueConstraint(columnNames = {"idUsuario", "idProducto"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class favorito {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFavorito;
    
    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "idProducto", nullable = false)
    private Producto producto;
    
    @Column(name = "fechaAgregado", nullable = false)
    private LocalDateTime fechaAgregado;
    
    @PrePersist
    protected void onCreate() {
        fechaAgregado = LocalDateTime.now();
    }
}