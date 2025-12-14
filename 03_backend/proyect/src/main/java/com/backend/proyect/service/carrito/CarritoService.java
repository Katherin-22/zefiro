package com.backend.proyect.service.carrito;

import com.backend.proyect.dto.carrito.AgregarItemDTO;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.carrito.DetalleCarrito;
import com.backend.proyect.model.carrito.EstadoCarritoEnum;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.productos.Stock;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.usuario.Usuario;

import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.model.pedido.DetallePedido;
import com.backend.proyect.model.pedido.EstadoPedido;
import com.backend.proyect.model.metodoPagos.MetodoPago;

// Paquetes del Repositorio
import com.backend.proyect.repository.carrito.CarritoRepository;
import com.backend.proyect.repository.metodoPagos.MetodoPagoRepository;
import com.backend.proyect.repository.productos.StockRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.repository.carrito.DetalleCarritoRepository;
import com.backend.proyect.repository.pedido.pedidoRepository;
import com.backend.proyect.repository.pedido.DetallePedidoRepository;
import com.backend.proyect.repository.pedido.EstadoPedidoRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime; // Usar LocalDateTime
import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final StockRepository stockRepository;
    private final pedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final EstadoPedidoRepository estadoPedidoRepository;
    private final MetodoPagoRepository metodoPagoRepository; // Correcto: camelCase

    // Inyección de dependencias
    public CarritoService(CarritoRepository carritoRepository, DetalleCarritoRepository detalleCarritoRepository,
                          StockRepository stockRepository, pedidoRepository pedidoRepository,
                          UsuarioRepository usuarioRepository, DetallePedidoRepository detallePedidoRepository,
                          EstadoPedidoRepository estadoPedidoRepository,
                          MetodoPagoRepository metodoPagoRepository) {

        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.stockRepository = stockRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.estadoPedidoRepository = estadoPedidoRepository;
        this.metodoPagoRepository = metodoPagoRepository;    }

    /**
     * Obtiene el carrito activo del usuario, o crea uno nuevo si no existe.
     */
    public Carrito obtenerCarritoActivo(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        return carritoRepository.findByUsuarioAndEstadoCarrito(usuario, EstadoCarritoEnum.Activo)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = new Carrito();
                    nuevoCarrito.setUsuario(usuario);
                    nuevoCarrito.setFechaCreacion(LocalDateTime.now());
                    nuevoCarrito.setEstadoCarrito(EstadoCarritoEnum.Activo);
                    return carritoRepository.save(nuevoCarrito);
                });
    }

    /**
     * Agrega un item al carrito o actualiza la cantidad si ya existe.
     */
    @Transactional
    public Carrito agregarOActualizarItem(Integer idUsuario, AgregarItemDTO itemDTO) {
        // ... (el método agregarOActualizarItem es correcto y no requiere cambios significativos)

        Carrito carrito = obtenerCarritoActivo(idUsuario);
        Stock stock = stockRepository.findById(itemDTO.getIdStock())
                .orElseThrow(() -> new NoSuchElementException("Variación de Stock no encontrada"));

        // Validar Stock
        if (stock.getStockActual() < itemDTO.getCantidad()) {
            throw new IllegalArgumentException("Stock insuficiente para esta cantidad.");
        }

        // Buscar si el item (idStock) ya existe en el carrito
        Optional<DetalleCarrito> detalleExistente = carrito.getDetalles().stream()
                .filter(d -> d.getStock().getIdStock().equals(itemDTO.getIdStock()))
                .findFirst();

        if (detalleExistente.isPresent()) {
            // Actualizar cantidad
            DetalleCarrito detalle = detalleExistente.get();
            detalle.setCantidad(detalle.getCantidad() + itemDTO.getCantidad());
        } else {
            // Agregar nuevo item

            Producto producto = stock.getProducto();
            Promocion promocion = producto.getPromocion();

            // 1. Inicializar el precio con el precio base del producto
            Double precioUnitarioFinal = producto.getPrecio();
            Integer idPromocionAplicada = null;
            Integer porcentajeDescuento = null;

            if (promocion != null && promocion.isVigente()) {
                Integer descuentoAplicado = promocion.getDescuento();
                double porcentaje = descuentoAplicado / 100.0;

                // Aplicar el descuento al precio original
                double precioConDescuento = producto.getPrecio() * (1.0 - porcentaje);

                // Redondear a dos decimales (CRÍTICO para manejo de dinero)
                precioUnitarioFinal = Math.round(precioConDescuento * 100.0) / 100.0;

                idPromocionAplicada = promocion.getIdPromocion();
                porcentajeDescuento = descuentoAplicado;

            }

            DetalleCarrito nuevoDetalle = new DetalleCarrito();
            nuevoDetalle.setCarrito(carrito);
            nuevoDetalle.setStock(stock);
            nuevoDetalle.setCantidad(itemDTO.getCantidad());
            // El precio unitario se toma del precio actual del producto (con descuento aplicado)
            nuevoDetalle.setPrecioUnitario(precioUnitarioFinal);

            if (idPromocionAplicada != null) {
                // Asignamos la promoción completa al detalle
                nuevoDetalle.setPromocionAplicada(promocion);
                nuevoDetalle.setPorcentajeDescuento(porcentajeDescuento);
            } else {
                // Si no hay promoción, asignamos NULL para coincidir con la BD
                nuevoDetalle.setPromocionAplicada(null);
                nuevoDetalle.setPorcentajeDescuento(null);
            }

            carrito.getDetalles().add(nuevoDetalle);
        }

        return carritoRepository.save(carrito);
    }

    // ... Métodos para eliminar item, actualizar cantidad, etc. ...

    /**
     * PROCESO CRÍTICO: Finaliza el carrito y crea un Pedido (Transaccional)
     * @param idUsuario ID del usuario que compra
     * @param idMetodoPago Método de pago seleccionado
     * @return El Pedido creado
     */
    @Transactional
    public Pedido finalizarCheckout(Integer idUsuario, Integer idMetodoPago) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);
        if (carrito.getDetalles().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío. No se puede generar un pedido.");
        }

        BigDecimal totalCalculado = BigDecimal.ZERO;

        // 1. Revalidación de Stock y Cálculo del Total
        for (DetalleCarrito detalle : carrito.getDetalles()) {
            Stock stock = stockRepository.findById(detalle.getStock().getIdStock())
                    .orElseThrow(() -> new NoSuchElementException("Stock no disponible para id: " + detalle.getStock().getIdStock()));

            if (stock.getStockActual() < detalle.getCantidad()) {
                throw new IllegalArgumentException("El producto " + stock.getProducto().getNombreProducto() + " no tiene suficiente stock.");
            }

            BigDecimal cantidad = BigDecimal.valueOf(detalle.getCantidad());
            BigDecimal precioUnitario = BigDecimal.valueOf(detalle.getPrecioUnitario());

            BigDecimal subtotalItem = cantidad.multiply(precioUnitario);

            totalCalculado = totalCalculado.add(subtotalItem);

        }

        // 2. Creación del Pedido

        EstadoPedido estadoInicial = estadoPedidoRepository.findById(2)
                .orElseThrow(() -> new IllegalStateException("El estado 'Pagado' (ID 2) no existe. Verifica la tabla EstadoPedido."));


        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(carrito.getUsuario());
        nuevoPedido.setFechaPedido(LocalDate.now());
        nuevoPedido.setTotalFinal(totalCalculado);

        MetodoPago metodoPago = metodoPagoRepository.getReferenceById(idMetodoPago);        nuevoPedido.setMetodoPago(metodoPago);

        nuevoPedido.setEstadoPedido(estadoInicial);

        Pedido pedidoGuardado = pedidoRepository.save(nuevoPedido);

        // 3. Creación de DetallePedido y Descuento de Stock
        for (DetalleCarrito detalle : carrito.getDetalles()) {
            DetallePedido dp = new DetallePedido();
            dp.setPedido(pedidoGuardado);
            dp.setStock(detalle.getStock());
            dp.setCantidad(detalle.getCantidad());
            dp.setPrecioUnitario(detalle.getPrecioUnitario());

            // Guardar el DetallePedido
            detallePedidoRepository.save(dp);

            // Descontar Stock (CRÍTICO)
            Stock stockAActualizar = detalle.getStock();
            stockAActualizar.setStockActual(stockAActualizar.getStockActual() - detalle.getCantidad());
            stockRepository.save(stockAActualizar);
        }

        // 4. Marcar Carrito como completado
        carrito.setEstadoCarrito(EstadoCarritoEnum.Procesado); // Usar el setter correcto
        carritoRepository.save(carrito);

        return pedidoGuardado;
    }

    public double calcularTotalCarrito(Integer idUsuario) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);

        double totalCalculado = 0.0;

        for (DetalleCarrito detalle : carrito.getDetalles()) {
            totalCalculado += detalle.getCantidad() * detalle.getPrecioUnitario();
        }

        return totalCalculado;
    }    

}