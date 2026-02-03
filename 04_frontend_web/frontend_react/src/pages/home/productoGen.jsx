import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../components/carrito/CarritoContext.jsx";
import { useGetStock } from "../../hooks/stock/useGetStock";
import MenuHome from "../../layouts/home/menuHome";
import "../../styles/home/productGen.css"
import api_url from "../../services/administrador/api";
import { getImagenById } from "../../services/administrador/ImagenService.js";

const ProductoGen = () => {
    // ===============================================
    // 1. LLAMADA INCONDICIONAL DE TODOS LOS HOOKS (TOP LEVEL)
    // ===============================================
    const { stock: listaStockCompleta } = useGetStock();
    const { codigoReferencia } = useParams();

    const { addToCart, loading: cartLoading, error: cartError, setError: setCartError, setShowCartMenu } = useCart();
    
    // Todos los useState, incondicionalmente, al inicio
    const [quantity, setQuantity] = useState(1); 
    const [favorito, setFavorito] = useState(false);
    const [imagenModal, setImagenModal] = useState(null);
    const [imagenesProducto, setImagenesProducto] = useState([]);
    const [imagenPrincipal, setImagenPrincipal] = useState("");
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);
    const [colorSeleccionado, setColorSeleccionado] = useState("");
    const [tallaSeleccionada, setTallaSeleccionada] = useState("");

    // ===============================================
    // 2. LÓGICA DE CÁLCULO (INCONDICIONAL)
    // ===============================================
    
    // **CALCULAR PRODUCTO BASE:** Se hace después de los Hooks, antes del return condicional
    const productoBaseStockItem = listaStockCompleta.find(p => p.producto?.codigoReferencia === codigoReferencia);
    const producto = productoBaseStockItem?.producto;
    
    // **useMemo para Stock:** Se llama incondicionalmente, pero su lógica maneja el caso de producto no encontrado/no seleccionado.
    const { stockActual: stockDisponible, idStock: idStockSeleccionado } = useMemo(() => {
        if (!producto || !colorSeleccionado || !tallaSeleccionada) {
            return { stockActual: 0, idStock: null };
        }

        const stockItem = listaStockCompleta.find(item => {
            const itemColorId = String(item.idColor);
            const selectedColorId = String(colorSeleccionado);
            
            return (
                item.idProducto === producto.idProducto &&
                itemColorId === selectedColorId &&
                item.nombre === tallaSeleccionada
            );
        });

        return stockItem
            ? { stockActual: stockItem.stockActual, idStock: stockItem.idStock }
            : { stockActual: 0, idStock: null };
    }, [listaStockCompleta, producto, colorSeleccionado, tallaSeleccionada]);

    // Cálculo del Precio Total
    const totalPrice = producto?.precio ? producto.precio * quantity : 0; 

    // ===============================================
    // 3. EFECTOS (useEffects) - Se colocan inmediatamente después de los useStates y useMemo
    // ===============================================

    // 1️⃣ Cargar COLORES del producto
    useEffect(() => {
        if (!producto) return; // Retorno anticipado solo dentro del useEffect

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color`)
            .then(res => {
                setColores(res.data);
            })
            .catch(err => console.error("Error al cargar colores:", err));
    }, [producto]);

    // 2️⃣ Cargar IMÁGENES del producto
    useEffect(() => {
        if (!producto) return; // Retorno anticipado solo dentro del useEffect

        const cargarImagenes = async () => {
            try {
                const response = await getImagenById(producto.idProducto);
                if (response.data && response.data.length > 0) {
                    setImagenesProducto(response.data);
                    setImagenPrincipal(`http://localhost:8080${response.data[0].urlImagen}`);
                } else {
                    setImagenPrincipal(producto.imagen || "/imagenes_prueba/default.jpg");
                }
            } catch (error) {
                console.error("Error al cargar imágenes del producto:", error);
                setImagenPrincipal(producto.imagen || "/imagenes_prueba/default.jpg");
            }
        };

        cargarImagenes();
    }, [producto]);

    // 3️⃣ Cargar TALLAS
    useEffect(() => {
        // La condición para no hacer la llamada API debe estar DENTRO del useEffect
        if (!producto || !colorSeleccionado) {
            setTallas([]);
            setTallaSeleccionada("");
            return;
        }

        api_url.get(`/publico/stock/producto/${producto.idProducto}/color/${colorSeleccionado}/tallas`)
            .then(res => {
                setTallas(res.data);
                setTallaSeleccionada("");
            })
            .catch(err => console.error("Error al cargar tallas:", err));
    }, [producto, colorSeleccionado]);


    // ===============================================
    // 4. HANDLERS (Iguales que antes)
    // ===============================================

    const increaseQuantity = () => {
        if (quantity < stockDisponible) {
            setQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const handleAddToCart = async () => {
        setCartError(null); 

        if (!idStockSeleccionado || stockDisponible === 0) {
            setCartError("Debes seleccionar una combinación de color y talla válida.");
            return;
        }

        if (quantity > stockDisponible) {
            setCartError(`Solo quedan ${stockDisponible} unidades en stock.`);
            return;
        }

        const success = await addToCart(idStockSeleccionado, quantity);

        if (success) {
            setShowCartMenu(true); 
        }
    };

    const abrirModalImagen = (imagenUrl = null) => {
        const imagenAMostrar = imagenUrl || imagenPrincipal;
        setImagenModal({
            imagen: imagenAMostrar,
            nombre: producto.nombreProducto // Usar producto aquí es seguro porque ya pasamos la validación
        });
    };

    const cerrarModalImagen = () => {
        setImagenModal(null);
    };

    const cambiarImagenPrincipal = (nuevaImagenUrl) => {
        setImagenPrincipal(nuevaImagenUrl);
    };


    // ===============================================
    // 5. RENDERIZACIÓN CONDICIONAL (RETURN ANTICIPADO SEGURO)
    // ===============================================

    // Esto se ejecuta DESPUÉS de que todos los Hooks se han llamado, 
    // garantizando que el orden de los Hooks sea siempre el mismo.
    if (!producto) {
        return <h2 className="text-center mt-5" id="producto-no-encontrado">Producto no encontrado</h2>;
    }

    // ===============================================
    // 6. RENDERIZACIÓN PRINCIPAL
    // ===============================================
    
    // ... (El resto del return es igual) ...
    return (
        <div className="producto-detalle-container" id="producto-detalle-container">
            <MenuHome />
            <div className="producto-body-background" id="producto-body-background">
                <div className="container-fluid" id="producto-main-container">
                    <div className="row justify-content-center" id="producto-main-row">
                        <div className="col-md-10 col-lg-8" id="producto-content-col">
                            <div className="producto-card-detalle shadow-sm" id="producto-card-detalle">
                                <div className="producto-card-body-detalle" id="producto-card-body-detalle">

                                    {/* INFO PRINCIPAL */}
                                    <div className="row producto-info-principal" id="producto-info-principal">
                                        <div className="col-md-6 producto-col-imagen" id="producto-col-imagen">
                                            <div className="producto-imagen-container" id="producto-imagen-container">
                                                <img
                                                    src={imagenPrincipal}
                                                    alt={producto.nombreProducto}
                                                    className="producto-imagen-principal img-fluid rounded"
                                                    onClick={() => abrirModalImagen()}
                                                    style={{ cursor: 'pointer' }}
                                                    id="producto-imagen-principal"
                                                />
                                            </div>

                                            {imagenesProducto.length > 1 && (
                                                <div className="producto-miniaturas-container mt-3" id="producto-miniaturas-container">
                                                    <div className="row g-2 justify-content-center" id="producto-miniaturas-row">
                                                        {imagenesProducto.map((imagen, index) => (
                                                            <div key={index} className="col-auto" id={`producto-miniatura-col-${index}`}>
                                                                <img
                                                                    src={`http://localhost:8080${imagen.urlImagen}`}
                                                                    alt={`${producto.nombreProducto} ${index + 1}`}
                                                                    className={`producto-miniatura img-thumbnail ${imagenPrincipal === `http://localhost:8080${imagen.urlImagen}` ? 'miniatura-activa' : ''}`}
                                                                    onClick={() => cambiarImagenPrincipal(`http://localhost:8080${imagen.urlImagen}`)}
                                                                    style={{ cursor: 'pointer', width: '60px', height: '60px', objectFit: 'cover' }}
                                                                    id={`producto-miniatura-${index}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6 producto-col-detalles" id="producto-col-detalles">
                                            <div className="row" id="producto-detalles-row">
                                                <div className="col-12" id="producto-titulo-col">
                                                    <h1 className="producto-titulo-detalle" id="producto-titulo-detalle">{producto.nombreProducto}</h1>
                                                </div>
                                                <div className="col-12" id="producto-info-col">
                                                    <div className="producto-info-basica" id="producto-info-basica">
                                                        <p className="producto-codigo-detalle" id="producto-codigo-detalle">
                                                            Código: <span id="producto-codigo-valor">{producto.codigoReferencia}</span>
                                                        </p>
                                                        <p className="producto-precio-detalle" id="producto-precio-detalle">
                                                            Precio: <span className="producto-precio-valor" id="producto-precio-valor">${producto.precio?.toLocaleString()}</span>
                                                        </p>
                                                        <p className="producto-descripcion-detalle" id="producto-descripcion-detalle">
                                                            <span id="producto-descripcion-valor">{producto.descripcion}</span>
                                                        </p>
                                                    </div>

                                                    <div className="producto-info-adicional mt-4" id="producto-info-adicional">
                                                        <h2 className="producto-subtitulo-adicional" id="producto-subtitulo-adicional">Detalles del producto</h2>
                                                        <div className="producto-detalles-grid" id="producto-detalles-grid">
                                                            <p className="producto-categoria-detalle" id="producto-categoria-detalle">
                                                                <span className="producto-detalle-label" id="producto-categoria-label">Categoría:</span>
                                                                <span className="producto-detalle-valor" id="producto-categoria-valor">{producto.categoria?.nombreCategoria || 'N/A'}</span>
                                                            </p>
                                                            <p className="producto-tipo-detalle" id="producto-tipo-detalle">
                                                                <span className="producto-detalle-label" id="producto-tipo-label">Tipo:</span>
                                                                <span className="producto-detalle-valor" id="producto-tipo-valor">{producto.categoria?.tipoProducto?.nombreTipoProducto || 'N/A'}</span>
                                                            </p>
                                                            <p className="producto-genero-detalle" id="producto-genero-detalle">
                                                                <span className="producto-detalle-label" id="producto-genero-label">Género:</span>
                                                                <span className="producto-detalle-valor" id="producto-genero-valor">{producto.tipoPublico?.nombrePublico || 'N/A'}</span>
                                                            </p>
                                                            <p className="producto-material-detalle" id="producto-material-detalle">
                                                                <span className="producto-detalle-label" id="producto-material-label">Material:</span>
                                                                <span className="producto-detalle-valor" id="producto-material-valor">{producto.material?.nombreMaterial || 'N/A'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SELECTORES COLORES Y TALLAS */}
                                    <div className="row producto-selectores-fila mt-4" id="producto-selectores-fila">
                                        <h2 className="producto-subtitulo-selectores" id="producto-subtitulo-selectores">Selecciona tus opciones</h2>
                                        <div className="col-md-6" id="producto-selector-color-col">
                                            <label className="form-label producto-label-selector" id="producto-label-color">Color:</label>
                                            <select
                                                className="form-select producto-select-color"
                                                value={colorSeleccionado}
                                                onChange={(e) => {
                                                    setColorSeleccionado(e.target.value);
                                                    setQuantity(1); 
                                                }}
                                                id="producto-select-color"
                                            >
                                                <option value="" id="producto-option-color-default">Seleccione un color</option>
                                                {colores.map((color) => (
                                                    <option key={color.idColor} value={color.idColor} id={`producto-option-color-${color.idColor}`}>
                                                        {color.nombreColor}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6" id="producto-selector-talla-col">
                                            <label className="form-label producto-label-selector" id="producto-label-talla">Talla:</label>
                                            <select
                                                className="form-select producto-select-talla"
                                                value={tallaSeleccionada}
                                                onChange={(e) => {
                                                    setTallaSeleccionada(e.target.value);
                                                    setQuantity(1); 
                                                }}
                                                disabled={!colorSeleccionado || tallas.length === 0}
                                                id="producto-select-talla"
                                            >
                                                <option value="" id="producto-option-talla-default">Seleccione una talla</option>
                                                {tallas.map((talla, index) => (
                                                    <option key={index} value={talla.nombre} id={`producto-option-talla-${index}`}>
                                                        {talla.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* CARRITO: CONTROLES DE CANTIDAD Y STOCK */}
                                    <div className="row producto-stock-cantidad-fila mt-4 align-items-center" id="producto-stock-cantidad-fila">
                                        <div className="col-md-6" id="producto-stock-col">
                                            <p className={`producto-stock-detalle ${stockDisponible > 0 ? 'text-success' : 'text-danger'} mb-0`} id="producto-stock-detalle">
                                                <strong>Stock Disponible:</strong> <span id="producto-stock-valor">{stockDisponible}</span>
                                            </p>
                                        </div>

                                        <div className="col-md-6" id="producto-cantidad-col">
                                            <label className="form-label producto-label-cantidad">Cantidad:</label>
                                            <div className="input-group" id="producto-input-group-cantidad">
                                                <button
                                                    className="btn btn-outline-secondary producto-btn-cantidad-menos"
                                                    type="button"
                                                    onClick={decreaseQuantity}
                                                    disabled={quantity <= 1 || cartLoading}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    className="form-control text-center producto-input-cantidad"
                                                    value={quantity}
                                                    readOnly
                                                    id="producto-input-cantidad"
                                                />
                                                <button
                                                    className="btn btn-outline-secondary producto-btn-cantidad-mas"
                                                    type="button"
                                                    onClick={increaseQuantity}
                                                    disabled={quantity >= stockDisponible || cartLoading || stockDisponible === 0}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* CARRITO: PRECIO TOTAL */}
                                        <div className="col-12 mt-3" id="producto-precio-total-col">
                                            <h4 className="producto-precio-total-detalle mb-0">
                                                <strong>Precio Total:</strong>{" "}
                                                <span id="producto-precio-total-valor">
                                                    {new Intl.NumberFormat("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                    }).format(totalPrice)}
                                                </span>
                                            </h4>
                                        </div>
                                    </div>

                                    {/* CARRITO: MENSAJE DE ERROR DEL CARRITO */}
                                    {(cartError && <div className="alert alert-danger mt-3" id="producto-cart-error-alert">{cartError}</div>)}


                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="row producto-botones-fila justify-content-center mt-4" id="producto-botones-fila">
                                        <div className="col-auto" id="producto-boton-favorito-col">
                                            <button
                                                className={`btn producto-btn-favorito ${favorito ? "btn-danger" : "btn-outline-danger"}`}
                                                onClick={() => setFavorito(!favorito)}
                                                id="producto-btn-favorito"
                                            >
                                                <i className={`bi ${favorito ? "bi-heart-fill" : "bi-heart"} producto-icono-favorito`} id="producto-icono-favorito"></i>
                                                {favorito ? " Quitar favorito" : " Agregar a favoritos"}
                                            </button>
                                        </div>

                                        {/* CARRITO: Botón Agregar al Carrito */}

                                        <div className="col-auto" id="producto-boton-comprar-col">
                                            <button
                                                className="btn producto-btn-comprar btn-success"
                                                onClick={handleAddToCart}
                                                disabled={cartLoading || !idStockSeleccionado || stockDisponible === 0} 
                                                id="producto-btn-comprar"
                                            >
                                                {cartLoading ? (
                                                    <>
                                                        <i className="bi bi-arrow-clockwise me-2 spin-animation" id="producto-icono-cargando"></i>
                                                        Añadiendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cart-plus producto-icono-comprar me-2" id="producto-icono-comprar"></i>
                                                        Agregar al Carrito
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="col-auto" id="producto-boton-volver-col">
                                            <Link to="/Catalogo" className="btn producto-btn-volver btn-outline-secondary" id="producto-btn-volver">
                                                <i className="bi bi-arrow-left producto-icono-volver me-2" id="producto-icono-volver"></i>
                                                Volver al catálogo
                                            </Link>
                                        </div>
                                    </div>

                                    {/* SECCIÓN COMENTARIOS */}
                                    <div className="row producto-comentarios-fila mt-5" id="producto-comentarios-fila">
                                        <div className="col-12" id="producto-comentarios-col">
                                            <div className="producto-seccion-comentarios" id="producto-seccion-comentarios">
                                                <h2 className="producto-titulo-comentarios text-center mb-4" id="producto-titulo-comentarios">
                                                    <i className="bi bi-chat-dots me-2" id="producto-icono-comentarios"></i>
                                                    Opiniones del producto
                                                </h2>

                                                <form className="producto-form-comentario container" id="producto-form-comentario">
                                                    <div className="row align-items-end" id="producto-form-comentario-row">
                                                        <div className="col-md-8" id="producto-input-comentario-col">
                                                            <label className="form-label producto-label-comentario" id="producto-label-comentario">Deja tu opinión</label>
                                                            <input
                                                                type="text"
                                                                name="opinion"
                                                                placeholder="Comparte tu experiencia con este producto..."
                                                                className="form-control producto-input-comentario"
                                                                id="producto-input-comentario"
                                                            />
                                                        </div>
                                                        <div className="col-md-4" id="producto-boton-comentario-col">
                                                            <button
                                                                type="submit"
                                                                className="btn producto-btn-enviar-comentario btn-outline-primary w-100"
                                                                id="producto-btn-enviar-comentario"
                                                            >
                                                                <i className="bi bi-send producto-icono-comentar me-2" id="producto-icono-comentar"></i>
                                                                Publicar comentario
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>

                                                <div className="producto-lista-comentarios mt-4" id="producto-lista-comentarios">
                                                    <p className="text-muted text-center" id="producto-sin-comentarios-message">
                                                        <i className="bi bi-info-circle me-2" id="producto-icono-sin-comentarios"></i>
                                                        Sé el primero en comentar este producto
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PARA VER IMAGEN */}
            {imagenModal && (
                <div className="modal-overlay" onClick={cerrarModalImagen} id="producto-modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} id="producto-modal-content">
                        <div className="modal-header" id="producto-modal-header">
                            <h3 id="producto-modal-titulo">{imagenModal.nombre}</h3>
                            <button className="close-button" onClick={cerrarModalImagen} id="producto-modal-close">×</button>
                        </div>
                        <div className="modal-body" id="producto-modal-body">
                            <img
                                src={imagenModal.imagen}
                                alt={imagenModal.nombre}
                                className="modal-image"
                                id="producto-modal-image"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductoGen;