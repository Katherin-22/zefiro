package com.backend.proyect.model.usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "Usuario")

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idUsuario", unique = true )
    private Integer idUsuario;

    @Column(name = "numeroDocumento", nullable = false)
    private Integer numeroDocumento;

    @Column(name = "nombreUsuario" , nullable = false)
    private String nombreUsuario;

    @Column(name = "primerApellido", nullable = false)
    private String primerApellido;

    @Column(name = "segundoApellido")
    private String segundoApellido;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "password")
    private String password;

    @Column(name = "correoElectronico" , unique = true)
    private String correoElectronico;

    @Column(name = "Direccion")
    private String Direccion;

    @Column(name = "verify_otp")
    private String verify_otp;

    @Column(name = "is_account_verified", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isAccountVerified;

    @Column(name = "verify_otp_expire_at")
    private Timestamp verify_otp_expire_at;

    @Column(name = "reset_otp")
    private String reset_otp;

    @Column(name = "reset_otp_expire_at")
    private Timestamp reset_otp_expire_at;

    @ManyToOne
    @JoinColumn(name = "idRol", referencedColumnName = "idRol")
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "idTipoDeDocumento", referencedColumnName = "idTipoDeDocumento")
    private TipoDocumento  tipo_de_documento;

    @ManyToOne
    @JoinColumn(name = "idestado_usuario", referencedColumnName = "idestado_usuario")
    private EstadoUsuario  estado_usuario;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp created_at;

    @UpdateTimestamp
    private Timestamp updated_at;

}


