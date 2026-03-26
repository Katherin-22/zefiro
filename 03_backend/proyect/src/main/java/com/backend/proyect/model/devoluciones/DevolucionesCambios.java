package com.backend.proyect.model.devoluciones;

import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "tipo_solicitud" , nullable = false)
    private String tipoSolicitud;

    @Column(name = "estado_solicitud", nullable = false)
    private String estadoSolicitud;

    @Column(name = "fecha_solicitud")
    private String fechaSolicitud;

    @Column(name = "fecha_respuesta")
    private String fechaRespuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", referencedColumnName = "idUsuario")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "pedidos", "devoluciones"})
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idPedido", referencedColumnName = "idPedido")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "usuario", "carrito", "detalles"})
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProducto", referencedColumnName = "idProducto")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "stocks", "categoria"})
    private Producto producto;

}
