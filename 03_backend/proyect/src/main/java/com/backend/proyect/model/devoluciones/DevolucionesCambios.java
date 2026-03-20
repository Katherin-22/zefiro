package com.backend.proyect.model.devoluciones;

import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "devoluciones_Cambios")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DevolucionesCambios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_devolucion")
    private Integer id_devolucion;

    @Column(name = "motivo", nullable = false)
    private String motivo;

    @Column(name = "tipo_solicitud", nullable = false)
    private String tipoSolicitud;

    @Column(name = "estado_solicitud", nullable = false)
    private String estadoSolicitud;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", referencedColumnName = "idUsuario")
    @JsonIgnoreProperties({
        "devolucionesCambios",  // ← Ignorar la colección de devoluciones en Usuario
        "pedidos",              // ← Ignorar pedidos del usuario
        "carritos",             // ← Ignorar carritos del usuario
        "favoritos",            // ← Ignorar favoritos del usuario
        "comentarios",          // ← Ignorar comentarios del usuario
        "hibernateLazyInitializer", 
        "handler"
    })
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idPedido", referencedColumnName = "idPedido")
    @JsonIgnoreProperties({
        "usuario",              // ← Ignorar el usuario del pedido (para evitar ciclo)
        "detalles",             // ← Ignorar detalles del pedido
        "carrito",              // ← Ignorar carrito asociado
        "hibernateLazyInitializer", 
        "handler"
    })
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProducto", referencedColumnName = "idProducto")
    @JsonIgnoreProperties({
        "stock",                // ← Ignorar stock del producto
        "categoria",            // ← Ignorar categoría
        "marca",                // ← Ignorar marca
        "material",             // ← Ignorar material
        "tipoPublico",          // ← Ignorar tipo de público
        "promocion",            // ← Ignorar promoción
        "imagenes",             // ← Ignorar imágenes
        "hibernateLazyInitializer", 
        "handler"
    })
    private Producto producto;
}