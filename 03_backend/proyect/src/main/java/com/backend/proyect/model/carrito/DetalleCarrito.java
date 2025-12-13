/*import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "DetalleCarrito")

public class DetalleCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idDetalleCarrito")
    private Integer idDetalleCarrito;

    @NotNull
    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precioUnitario", nullable = false)
    private Double precioUnitario;


    @ManyToOne
    @JoinColumn(name = "idCarrito", referencedColumnName = "idCarrito")
    private Carrito Carrito;

    @ManyToOne(optional = false)
    @JoinColumn(name = "idStock", referencedColumnName = "idStock")
    private Stock stock;
}
*/
