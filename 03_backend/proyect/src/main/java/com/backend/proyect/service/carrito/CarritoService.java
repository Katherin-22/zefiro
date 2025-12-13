/*package com.backend.proyect.service.carrito;

import com.backend.proyect.dto.carrito.AgregarItemDTO;
import com.backend.proyect.model.carrito.Carrito;
import com.backend.proyect.model.carrito.DetalleCarrito;
import com.backend.proyect.model.carrito.EstadoCarritoEnum;
import com.backend.proyect.model.productos.Producto;
import com.backend.proyect.model.productos.Stock;
import com.backend.proyect.model.promociones.Promocion;
import com.backend.proyect.model.usuario.Usuario;

// Asumo estas entidades del proceso de Checkout (Pedidos)
import com.backend.proyect.model.pedido.Pedido;
import com.backend.proyect.model.pedido.DetallePedido;
import com.backend.proyect.model.pago.MetodoPago; // Asumo esta entidad

// Paquetes del Repositorio
import com.backend.proyect.repository.carrito.CarritoRepository;
import com.backend.proyect.repository.productos.StockRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.repository.carrito.DetalleCarritoRepository;
import com.backend.proyect.repository.pedido.PedidoRepository; // <-- Agregado
import com.backend.proyect.repository.pedido.DetallePedidoRepository; // <-- Necesario para guardar el detalle del pedido

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime; // Usar LocalDateTime
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final StockRepository stockRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    // Nuevo repositorio necesario para guardar los detalles del pedido
    private final DetallePedidoRepository detallePedidoRepository;

    // Inyección de dependencias
    public CarritoService(CarritoRepository carritoRepository, DetalleCarritoRepository detalleCarritoRepository,
                          StockRepository stockRepository, PedidoRepository pedidoRepository,
                          UsuarioRepository usuarioRepository, DetallePedidoRepository detallePedidoRepository) {
        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.stockRepository = stockRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.detallePedidoRepository = detallePedidoRepository; // <-- Inyectado
    }

    /**
     * Obtiene el carrito activo del usuario, o crea uno nuevo si no existe.
     *
    public Carrito obtenerCarritoActivo(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        // CORRECCIÓN: Usar findByUsuarioAndEstadoCarrito
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
     *
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

            if (promocion != null && promocion.isVigente()) {
                Double descuentoAplicado = promocion.getDescuento();
                double porcentaje = descuentoAplicado / 100.0;

                // Aplicar el descuento al precio original
                double precioConDescuento = producto.getPrecio() * (1.0 - porcentaje);

                // Redondear a dos decimales (CRÍTICO para manejo de dinero)
                precioUnitarioFinal = Math.round(precioConDescuento * 100.0) / 100.0;
            }



            DetalleCarrito nuevoDetalle = new DetalleCarrito();
            nuevoDetalle.setCarrito(carrito);
            nuevoDetalle.setStock(stock);
            nuevoDetalle.setCantidad(itemDTO.getCantidad());
            // El precio unitario se toma del precio actual del producto (con descuento aplicado)
            nuevoDetalle.setPrecioUnitario(precioUnitarioFinal);

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
     *
    @Transactional
    public Pedido finalizarCheckout(Integer idUsuario, Integer idMetodoPago) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);
        if (carrito.getDetalles().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío. No se puede generar un pedido.");
        }

        double totalCalculado = 0.0;

        // 1. Revalidación de Stock y Cálculo del Total
        for (DetalleCarrito detalle : carrito.getDetalles()) {
            Stock stock = stockRepository.findById(detalle.getStock().getIdStock())
                    .orElseThrow(() -> new NoSuchElementException("Stock no disponible para id: " + detalle.getStock().getIdStock()));

            if (stock.getStockActual() < detalle.getCantidad()) {
                throw new IllegalArgumentException("El producto " + stock.getProducto().getNombreProducto() + " no tiene suficiente stock.");
            }

            totalCalculado += detalle.getCantidad() * detalle.getPrecioUnitario();
        }


        // 2. Creación del Pedido
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(carrito.getUsuario());
        nuevoPedido.setFechaPedido(LocalDateTime.now()); // CORRECCIÓN: Usar LocalDateTime.now()
        nuevoPedido.setTotalPedido(totalCalculado);
        nuevoPedido.setMetodoPago(new MetodoPago(idMetodoPago));

        Pedido pedidoGuardado = pedidoRepository.save(nuevoPedido);

        // 3. Creación de DetallePedido y Descuento de Stock
        for (DetalleCarrito detalle : carrito.getDetalles()) {
            DetallePedido dp = new DetallePedido();
            dp.setPedido(pedidoGuardado);
            dp.setStock(detalle.getStock());
            dp.setCantidad(detalle.getCantidad());
            dp.setPrecioUnitario(detalle.getPrecioUnitario());

            // CORRECCIÓN: Guardar el DetallePedido
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
    */