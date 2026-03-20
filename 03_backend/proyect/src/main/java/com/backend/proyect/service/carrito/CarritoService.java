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
import com.backend.proyect.model.metodoPagos.*;

// Paquetes del Repositorio
import com.backend.proyect.repository.carrito.CarritoRepository;
import com.backend.proyect.repository.metodoPagos.*;
import com.backend.proyect.repository.productos.StockRepository;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.repository.carrito.DetalleCarritoRepository;
import com.backend.proyect.repository.pedido.pedidoRepository;
import com.backend.proyect.repository.pedido.DetallePedidoRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.List;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final StockRepository stockRepository;
    private final pedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final MetodoPagoRepository metodoPagoRepository;

    // Inyección de dependencias (SIN EstadoPedidoRepository)
    public CarritoService(CarritoRepository carritoRepository, 
                          DetalleCarritoRepository detalleCarritoRepository,
                          StockRepository stockRepository, 
                          pedidoRepository pedidoRepository,
                          UsuarioRepository usuarioRepository, 
                          DetallePedidoRepository detallePedidoRepository,
                          MetodoPagoRepository metodoPagoRepository) {

        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.stockRepository = stockRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.metodoPagoRepository = metodoPagoRepository;
    }

    /**
     * Obtiene el carrito activo del usuario, o crea uno nuevo si no existe.
     */
    @Transactional
    public Carrito obtenerCarritoActivo(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        Carrito carrito = carritoRepository.findByUsuarioAndEstadoCarritoWithDetails(usuario, EstadoCarritoEnum.Activo)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = new Carrito();
                    nuevoCarrito.setUsuario(usuario);
                    nuevoCarrito.setFechaCreacion(LocalDateTime.now());
                    nuevoCarrito.setEstadoCarrito(EstadoCarritoEnum.Activo);
                    return carritoRepository.save(nuevoCarrito);
                });

        // Forzar inicialización de Hibernate
        if (carrito.getDetalles() != null) {
            carrito.getDetalles().forEach(detalle -> {
                if (detalle.getStock() != null) {
                    Producto p = detalle.getStock().getProducto();
                    if (p != null) {
                        p.getNombreProducto();
                    }
                }
            });
        }

        return carrito;
    }

    /**
     * Agrega un item al carrito o actualiza la cantidad si ya existe.
     */
    @Transactional
    public Carrito agregarOActualizarItem(Integer idUsuario, AgregarItemDTO itemDTO) {

        Carrito carrito = obtenerCarritoActivo(idUsuario);
        Stock stock = stockRepository.findById(itemDTO.getIdStock())
                .orElseThrow(() -> new NoSuchElementException("Variación de Stock no encontrada"));

        if (stock.getStockActual() < itemDTO.getCantidad()) {
            throw new IllegalArgumentException("No hay suficiente stock disponible. Unidades en inventario: " + stock.getStockActual());
        }

        Optional<DetalleCarrito> detalleExistente = carrito.getDetalles().stream()
                .filter(d -> d.getStock().getIdStock().equals(itemDTO.getIdStock()))
                .findFirst();

        int nuevaCantidad = itemDTO.getCantidad();
        if (detalleExistente.isPresent()) {
            nuevaCantidad += detalleExistente.get().getCantidad();
        }

        if (stock.getStockActual() < nuevaCantidad) {
            throw new IllegalArgumentException("Stock insuficiente para la cantidad solicitada. Stock disponible: " + stock.getStockActual());
        }

        if (detalleExistente.isPresent()) {
            DetalleCarrito detalle = detalleExistente.get();
            detalle.setCantidad(nuevaCantidad);
            detalleCarritoRepository.save(detalle);
        } else {
            Producto producto = stock.getProducto();
            Promocion promocion = producto.getPromocion();

            Double precioUnitarioFinal = producto.getPrecio();
            Integer porcentajeDescuento = null;

            if (promocion != null && promocion.isVigente()) {
                Integer descuentoAplicado = promocion.getDescuento();
                double porcentaje = descuentoAplicado / 100.0;
                double precioConDescuento = producto.getPrecio() * (1.0 - porcentaje);
                precioUnitarioFinal = Math.round(precioConDescuento * 100.0) / 100.0;
                porcentajeDescuento = descuentoAplicado;
            }

            DetalleCarrito nuevoDetalle = new DetalleCarrito();
            nuevoDetalle.setCarrito(carrito);
            nuevoDetalle.setStock(stock);
            nuevoDetalle.setCantidad(itemDTO.getCantidad());
            nuevoDetalle.setPrecioUnitario(precioUnitarioFinal);

            if (porcentajeDescuento != null) {
                nuevoDetalle.setPromocionAplicada(promocion);
                nuevoDetalle.setPorcentajeDescuento(porcentajeDescuento);
            } else {
                nuevoDetalle.setPromocionAplicada(null);
                nuevoDetalle.setPorcentajeDescuento(null);
            }

            DetalleCarrito detalleGuardado = detalleCarritoRepository.save(nuevoDetalle);
            carrito.getDetalles().add(detalleGuardado);
        }

        return obtenerCarritoActivo(idUsuario);
    }

    // ===============================================
    // SINCRONIZAR CARRITO DE INVITADO
    // ===============================================
    @Transactional
    public Carrito sincronizarCarrito(Integer idUsuario, List<AgregarItemDTO> itemsInvitado) {

        Carrito carrito = obtenerCarritoActivo(idUsuario);

        for (AgregarItemDTO itemDTO : itemsInvitado) {

            Stock stock = stockRepository.findById(itemDTO.getIdStock())
                    .orElseThrow(() -> new NoSuchElementException("Variación de Stock no encontrada para ID: " + itemDTO.getIdStock()));

            Optional<DetalleCarrito> detalleExistente = carrito.getDetalles().stream()
                    .filter(d -> d.getStock().getIdStock().equals(itemDTO.getIdStock()))
                    .findFirst();

            int cantidadInvitado = itemDTO.getCantidad();

            if (detalleExistente.isPresent()) {
                DetalleCarrito detalle = detalleExistente.get();
                int nuevaCantidadTotal = detalle.getCantidad() + cantidadInvitado;

                if (stock.getStockActual() < nuevaCantidadTotal) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente para sincronizar el producto: " + stock.getProducto().getNombreProducto() +
                            ". Stock disponible: " + stock.getStockActual() + ", Total solicitado: " + nuevaCantidadTotal
                    );
                }

                detalle.setCantidad(nuevaCantidadTotal);
                detalleCarritoRepository.save(detalle);

            } else {
                if (stock.getStockActual() < cantidadInvitado) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente para agregar el producto: " + stock.getProducto().getNombreProducto() +
                            ". Stock disponible: " + stock.getStockActual() + ", Solicitado: " + cantidadInvitado
                    );
                }

                Producto producto = stock.getProducto();
                Promocion promocion = producto.getPromocion();
                Double precioUnitarioFinal = producto.getPrecio();
                Integer porcentajeDescuento = null;

                if (promocion != null && promocion.isVigente()) {
                    Integer descuentoAplicado = promocion.getDescuento();
                    double porcentaje = descuentoAplicado / 100.0;
                    double precioConDescuento = producto.getPrecio() * (1.0 - porcentaje);
                    precioUnitarioFinal = Math.round(precioConDescuento * 100.0) / 100.0;
                    porcentajeDescuento = descuentoAplicado;
                }

                DetalleCarrito nuevoDetalle = new DetalleCarrito();
                nuevoDetalle.setCarrito(carrito);
                nuevoDetalle.setStock(stock);
                nuevoDetalle.setCantidad(cantidadInvitado);
                nuevoDetalle.setPrecioUnitario(precioUnitarioFinal);

                if (porcentajeDescuento != null) {
                    nuevoDetalle.setPromocionAplicada(promocion);
                    nuevoDetalle.setPorcentajeDescuento(porcentajeDescuento);
                }

                DetalleCarrito detalleGuardado = detalleCarritoRepository.save(nuevoDetalle);
                carrito.getDetalles().add(detalleGuardado);
            }
        }

        return obtenerCarritoActivo(idUsuario);
    }

    // ===============================================
    // ACTUALIZAR CANTIDAD (PATCH)
    // ===============================================
    @Transactional
    public Carrito actualizarCantidadItem(Integer idDetalleCarrito, int nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero. Use el método de eliminación para remover.");
        }

        DetalleCarrito detalle = detalleCarritoRepository.findById(idDetalleCarrito)
                .orElseThrow(() -> new NoSuchElementException("Detalle de Carrito no encontrado con ID: " + idDetalleCarrito));

        Stock stock = detalle.getStock();

        if (stock.getStockActual() < nuevaCantidad) {
            throw new IllegalArgumentException("Stock insuficiente para la cantidad de: " + nuevaCantidad);
        }

        detalle.setCantidad(nuevaCantidad);
        detalleCarritoRepository.save(detalle);

        return obtenerCarritoActivo(detalle.getCarrito().getUsuario().getIdUsuario());
    }

    // ===============================================
    // ELIMINAR ITEM (DELETE)
    // ===============================================
    @Transactional
    public void eliminarItem(Integer idUsuario, Integer idDetalleCarrito) {
        DetalleCarrito detalle = detalleCarritoRepository.findById(idDetalleCarrito)
                .orElseThrow(() -> new NoSuchElementException("Detalle de Carrito no encontrado."));

        if (!detalle.getCarrito().getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("El detalle del carrito no pertenece al usuario especificado.");
        }

        detalleCarritoRepository.delete(detalle);
    }

    // ===============================================
    // VACIAR CARRITO (DELETE)
    // ===============================================
    @Transactional
    public void vaciarCarrito(Integer idUsuario) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);

        if (carrito.getDetalles().isEmpty()) {
            return;
        }

        detalleCarritoRepository.deleteByCarritoIdCarrito(carrito.getIdCarrito());
        carrito.getDetalles().clear();
        carritoRepository.save(carrito);
    }

    // ===============================================
    // FINALIZAR COMPRA / CHECKOUT (POST)
    // ===============================================
    @Transactional
    public Pedido finalizarCheckout(Integer idUsuario, Integer idMetodoPago) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);

        if (carrito.getDetalles().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío. No se puede generar un pedido.");
        }

        BigDecimal totalCalculado = BigDecimal.ZERO;

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

        // ✅ CREACIÓN DEL PEDIDO - SIN EstadoPedidoRepository
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setUsuario(carrito.getUsuario());
        nuevoPedido.setCarrito(carrito);
        nuevoPedido.setFechaPedido(LocalDate.now());
        nuevoPedido.setTotalFinal(totalCalculado);

        MetodoPago metodoPago = metodoPagoRepository.getReferenceById(idMetodoPago);
        nuevoPedido.setMetodoPago(metodoPago);

        // ✅ USAR EL ENUM DIRECTAMENTE
        nuevoPedido.setEstado(EstadoPedido.Pendiente);

        Pedido pedidoGuardado = pedidoRepository.save(nuevoPedido);

        for (DetalleCarrito detalle : carrito.getDetalles()) {
            DetallePedido dp = new DetallePedido();
            dp.setPedido(pedidoGuardado);
            dp.setStock(detalle.getStock());
            dp.setCantidad(detalle.getCantidad());
            dp.setPrecioUnitario(detalle.getPrecioUnitario());

            BigDecimal subtotal = BigDecimal.valueOf(detalle.getPrecioUnitario())
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));
            dp.setSubtotal(subtotal);

            detallePedidoRepository.save(dp);

            Stock stockAActualizar = detalle.getStock();
            stockAActualizar.setStockActual(stockAActualizar.getStockActual() - detalle.getCantidad());
            stockRepository.save(stockAActualizar);
        }

        carrito.setEstadoCarrito(EstadoCarritoEnum.Procesado);
        carritoRepository.save(carrito);

        return pedidoGuardado;
    }

    public double calcularTotalCarrito(Integer idUsuario) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);
        return carrito.getDetalles().stream()
                .mapToDouble(detalle -> detalle.getPrecioUnitario() * detalle.getCantidad())
                .sum();
    }
}