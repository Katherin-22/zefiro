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
import com.backend.proyect.model.metodosPago.MetodoPago;

// Paquetes del Repositorio
import com.backend.proyect.repository.carrito.CarritoRepository;
import com.backend.proyect.repository.metodosPago.MetodoPagoRepository;
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
import java.util.List; // Importar List

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
        this.metodoPagoRepository = metodoPagoRepository;
    }

    /**
     * Obtiene el carrito activo del usuario, o crea uno nuevo si no existe.
     * 🌟 IMPORTANTE: Utiliza findByUsuarioAndEstadoCarritoWithDetails para forzar
     * la carga de Stock y Producto, resolviendo el problema de serialización.
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

        // 🛠️ SOLUCIÓN PARA EL "OBJETO NULO": Forzar inicialización de Hibernate
        if (carrito.getDetalles() != null) {
            carrito.getDetalles().forEach(detalle -> {
                if (detalle.getStock() != null) {
                    Producto p = detalle.getStock().getProducto();
                    if (p != null) {
                        // Acceder a un campo fuerza a Hibernate a disparar el SELECT antes de cerrar la sesión
                        p.getNombreProducto();
                    }
                }
            });
        }

        return carrito;
    }

    /**
     * Agrega un item al carrito o actualiza la cantidad si ya existe.
     * Se mantiene @Transactional para asegurar la consistencia.
     */
    @Transactional
    public Carrito agregarOActualizarItem(Integer idUsuario, AgregarItemDTO itemDTO) {

        Carrito carrito = obtenerCarritoActivo(idUsuario);
        Stock stock = stockRepository.findById(itemDTO.getIdStock())
                .orElseThrow(() -> new NoSuchElementException("Variación de Stock no encontrada"));

        if (stock.getStockActual() < itemDTO.getCantidad()) {
            throw new IllegalArgumentException("No hay suficiente stock disponible. Unidades en inventario: " + stock.getStockActual());
        }

        // Buscar si el item (idStock) ya existe en el carrito
        Optional<DetalleCarrito> detalleExistente = carrito.getDetalles().stream()
                .filter(d -> d.getStock().getIdStock().equals(itemDTO.getIdStock()))
                .findFirst();

        int nuevaCantidad = itemDTO.getCantidad();
        if (detalleExistente.isPresent()) {
            // Si ya existe, se suma la cantidad enviada
            nuevaCantidad += detalleExistente.get().getCantidad();
        }

        // Validar Stock
        if (stock.getStockActual() < nuevaCantidad) {
            throw new IllegalArgumentException("Stock insuficiente para la cantidad solicitada. Stock disponible: " + stock.getStockActual());
        }

        if (detalleExistente.isPresent()) {
            // Actualizar cantidad
            DetalleCarrito detalle = detalleExistente.get();
            detalle.setCantidad(nuevaCantidad);
            detalleCarritoRepository.save(detalle);

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

            DetalleCarrito detalleGuardado = detalleCarritoRepository.save(nuevoDetalle);
            carrito.getDetalles().add(detalleGuardado);
        }

        // Al final, devolvemos el carrito recargado (con los JOIN FETCH) para asegurar
        // que la respuesta HTTP contenga todos los detalles completos.
        return obtenerCarritoActivo(idUsuario);
    }

    // ===============================================
    // SINCRONIZAR CARRITO DE INVITADO
    // ===============================================
    @Transactional // Garantiza la integridad de los datos
    public Carrito sincronizarCarrito(Integer idUsuario, List<AgregarItemDTO> itemsInvitado) {

        // 1. Obtener o crear el carrito activo del usuario (usando el método con JOIN FETCH)
        Carrito carrito = obtenerCarritoActivo(idUsuario);

        // 2. Iterar sobre cada ítem del carrito de invitado y procesarlo
        for (AgregarItemDTO itemDTO : itemsInvitado) {

            // Obtener Stock para validación
            Stock stock = stockRepository.findById(itemDTO.getIdStock())
                    .orElseThrow(() -> new NoSuchElementException("Variación de Stock no encontrada para ID: " + itemDTO.getIdStock()));

            // Buscar si el ítem (idStock) ya existe en el carrito del usuario logueado
            Optional<DetalleCarrito> detalleExistente = carrito.getDetalles().stream()
                    .filter(d -> d.getStock().getIdStock().equals(itemDTO.getIdStock()))
                    .findFirst();

            int cantidadInvitado = itemDTO.getCantidad();

            if (detalleExistente.isPresent()) {
                // Caso A: El ítem ya está en el carrito del usuario. SUMAR cantidades.
                DetalleCarrito detalle = detalleExistente.get();
                int nuevaCantidadTotal = detalle.getCantidad() + cantidadInvitado;

                // Validar Stock combinado
                if (stock.getStockActual() < nuevaCantidadTotal) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente para sincronizar el producto: " + stock.getProducto().getNombreProducto() +
                                    ". Stock disponible: " + stock.getStockActual() + ", Total solicitado: " + nuevaCantidadTotal +
                                    ". Por favor, revise su carrito de invitado."
                    );
                }

                // Actualizar cantidad
                detalle.setCantidad(nuevaCantidadTotal);
                detalleCarritoRepository.save(detalle);

            } else {
                // Caso B: El ítem es nuevo para el usuario. Agregar como un nuevo detalle.

                // Validar Stock
                if (stock.getStockActual() < cantidadInvitado) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente para agregar el producto: " + stock.getProducto().getNombreProducto() +
                                    ". Stock disponible: " + stock.getStockActual() + ", Solicitado: " + cantidadInvitado
                    );
                }

                // --- Replicar lógica de cálculo de precio y promoción ---
                Producto producto = stock.getProducto();
                Promocion promocion = producto.getPromocion();
                Double precioUnitarioFinal = producto.getPrecio();
                Integer porcentajeDescuento = null;

                if (promocion != null && promocion.isVigente()) {
                    Integer descuentoAplicado = promocion.getDescuento();
                    double porcentaje = descuentoAplicado / 100.0;
                    double precioConDescuento = producto.getPrecio() * (1.0 - porcentaje);
                    precioUnitarioFinal = Math.round(precioConDescuento * 100.0) / 100.0; // Redondeo
                    porcentajeDescuento = descuentoAplicado;
                }

                DetalleCarrito nuevoDetalle = new DetalleCarrito();
                nuevoDetalle.setCarrito(carrito);
                nuevoDetalle.setStock(stock);
                nuevoDetalle.setCantidad(cantidadInvitado);
                nuevoDetalle.setPrecioUnitario(precioUnitarioFinal);

                // Asignar promoción/descuento
                if (porcentajeDescuento != null) {
                    nuevoDetalle.setPromocionAplicada(promocion);
                    nuevoDetalle.setPorcentajeDescuento(porcentajeDescuento);
                }

                DetalleCarrito detalleGuardado = detalleCarritoRepository.save(nuevoDetalle);
                carrito.getDetalles().add(detalleGuardado); // Añadir a la lista en memoria
            }
        }

        // Devolvemos el carrito recargado para asegurar la serialización completa
        return obtenerCarritoActivo(idUsuario);
    }

    // ===============================================
    //  ACTUALIZAR CANTIDAD (PATCH)
    // ===============================================
    /**
     * Actualiza la cantidad de un ítem existente en el carrito.
     * @param idDetalleCarrito ID del ítem dentro del carrito a modificar.
     * @param nuevaCantidad La nueva cantidad deseada (debe ser > 0).
     * @return El Carrito actualizado.
     */
    @Transactional
    public Carrito actualizarCantidadItem(Integer idDetalleCarrito, int nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero. Use el método de eliminación para remover.");
        }

        DetalleCarrito detalle = detalleCarritoRepository.findById(idDetalleCarrito)
                .orElseThrow(() -> new NoSuchElementException("Detalle de Carrito no encontrado con ID: " + idDetalleCarrito));

        Stock stock = detalle.getStock();

        // 1. Validar Stock
        if (stock.getStockActual() < nuevaCantidad) {
            throw new IllegalArgumentException("Stock insuficiente para la cantidad de: " + nuevaCantidad);
        }

        // 2. Actualizar cantidad
        detalle.setCantidad(nuevaCantidad);
        detalleCarritoRepository.save(detalle);

        // 3. Devolver el Carrito completo asociado (usando el método con JOIN FETCH)
        return obtenerCarritoActivo(detalle.getCarrito().getUsuario().getIdUsuario());
    }

    // ===============================================
    //  ELIMINAR ITEM (DELETE)
    // ===============================================
    /**
     * Elimina un DetalleCarrito específico.
     * @param idUsuario ID del usuario (para validación de pertenencia).
     * @param idDetalleCarrito ID del ítem dentro del carrito a eliminar.
     */
    @Transactional
    public void eliminarItem(Integer idUsuario, Integer idDetalleCarrito) {
        DetalleCarrito detalle = detalleCarritoRepository.findById(idDetalleCarrito)
                .orElseThrow(() -> new NoSuchElementException("Detalle de Carrito no encontrado."));

        // Medida de seguridad: Validar que el ítem pertenezca al usuario correcto
        if (!detalle.getCarrito().getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("El detalle del carrito no pertenece al usuario especificado.");
        }

        detalleCarritoRepository.delete(detalle);
    }

    // ===============================================
    //  VACIAR CARRITO (DELETE)
    // ===============================================
    /**
     * Elimina todos los ítems de un carrito activo.
     * @param idUsuario ID del usuario cuyo carrito se debe vaciar.
     */
    @Transactional
    public void vaciarCarrito(Integer idUsuario) {
        Carrito carrito = obtenerCarritoActivo(idUsuario);

        if (carrito.getDetalles().isEmpty()) {
            return; // Ya está vacío.
        }

        // Eliminar todos los detalles
        detalleCarritoRepository.deleteByCarritoIdCarrito(carrito.getIdCarrito());

        // Limpiar la lista en memoria y guardar el Carrito (para reflejar el cambio inmediatamente)
        carrito.getDetalles().clear();
        carritoRepository.save(carrito);
    }


    // ===============================================
    // FINALIZAR COMPRA / CHECKOUT (POST)
    // ===============================================

    @Transactional
    public Pedido finalizarCheckout(Integer idUsuario, Integer idMetodoPago) {
        // Aseguramos que el carrito esté completamente cargado
        Carrito carrito = obtenerCarritoActivo(idUsuario);

        if (carrito.getDetalles().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío. No se puede generar un pedido.");
        }

        BigDecimal totalCalculado = BigDecimal.ZERO;

        // 1. Revalidación de Stock y Cálculo del Total
        for (DetalleCarrito detalle : carrito.getDetalles()) {
            // Buscamos Stock para obtener la versión más actualizada (aunque ya está cargada vía JOIN FETCH, es buena práctica)
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

        MetodoPago metodoPago = metodoPagoRepository.getReferenceById(idMetodoPago);
        nuevoPedido.setMetodoPago(metodoPago);

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