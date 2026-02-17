import { useEffect, useState } from "react";
import MenuHome from "../../layouts/home/menuHome";
import Footer from "../../layouts/home/footer";
import { useGetStock } from "../../hooks/stock/useGetStock";
import { getImagenById } from "../../services/administrador/ImagenService.js";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/home/paginaInicio.css";


export default function Home() {
  // El hook ahora devuelve List<Stock>
  const { stock, loading, error } = useGetStock();

  // addToCart es clave para actualizar el contador
  const { user } = useAuth();
  const navigate = useNavigate();
  const ROL_CLIENTE = 1;

  // Los estados ahora almacenarán objetos Stock, pero solo uno por cada Producto
  const [zapatos, setZapatos] = useState([]);
  const [bolsos, setBolsos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [imagenesProductos, setImagenesProductos] = useState({});

  console.log("🔍 Home component - Stock recibido:", stock);

  // Función para cargar imágenes de un producto
  const cargarImagenProducto = async (idProducto) => {
    try {
      const response = await getImagenById(idProducto);
      if (response.data && response.data.length > 0) {
        return `http://localhost:8080${response.data[0].urlImagen}`;
      }
      return null;
    } catch (error) {
      console.error("Error al cargar imagen del producto:", error);
      return null;
    }
  };

  // Filtrar productos, eliminar duplicados (por producto) y cargar sus imágenes
  useEffect(() => {
    const filtrarYCargarImagenes = async () => {
      if (stock && stock.length > 0) {
        console.log("🎯 Filtrando stocks únicos por producto...");

        // 1. Crear un mapa para obtener SOLO UN OBJETO Stock por cada idProducto (evitando duplicados en la vista)
        const productosUnicosMap = stock.reduce((map, currentStockItem) => {
          const idProducto = currentStockItem.idProducto;

          // Si el producto tiene un ID y aún no está en el mapa, lo agregamos.
          // Esto asegura que solo se muestre una tarjeta por producto.
          if (idProducto && !map.has(idProducto)) {
            map.set(idProducto, currentStockItem);
          }
          return map;
        }, new Map());

        const productosUnicos = Array.from(productosUnicosMap.values());

        // Funciones auxiliares para acceder a las propiedades anidadas de forma segura
        // CRITICAL FIX: Se corrige la ruta de acceso a la propiedad anidada
        const getProductType = (item) => item.nombreTipoProducto?.toLowerCase() || '';
        const getProductName = (item) => item.nombreProducto?.toLowerCase() || '';

        // 2. Filtrar Zapatos/Calzado
        const zapatosFiltrados = productosUnicos.filter(stockItem => {
          const tipo = getProductType(stockItem);
          const nombre = getProductName(stockItem);

          // Busca 'calzado' (valor real de la DB) o 'zapato' (lo que se buscaba antes)
          const esZapato = tipo.includes('zapato') || tipo.includes('calzado') || nombre.includes('zapato') || nombre.includes('tenis') || nombre.includes('deportivo');
          return esZapato;
        }).slice(0, 4);

        // 3. Filtrar Bolsos
        const bolsosFiltrados = productosUnicos.filter(stockItem => {
          const tipo = getProductType(stockItem);
          const nombre = getProductName(stockItem);

          // Busca 'bolso' (valor real de la DB)
          const esBolso = tipo.includes('bolso') || nombre.includes('bolso') || nombre.includes('mochila') || nombre.includes('cartera');
          return esBolso;
        }).slice(0, 4);

        // 4. Cargar imágenes
        const productosACargar = [...zapatosFiltrados, ...bolsosFiltrados];
        const todasImagenes = {};

        for (const stockItem of productosACargar) {
          const idProducto = stockItem.idProducto;
          if (idProducto && !todasImagenes[idProducto]) {
            const imagenUrl = await cargarImagenProducto(idProducto);
            // El objeto Stock.producto puede tener la URL de imagen directamente, úsala como fallback
            todasImagenes[idProducto] = imagenUrl || stockItem.imagen || "/imagenes_prueba/default.jpg";
          }
        }

        setImagenesProductos(todasImagenes);
        setZapatos(zapatosFiltrados);
        setBolsos(bolsosFiltrados);

        console.log("✅ Productos filtrados y listos.");
      } else {
        console.log("📭 No hay stock disponible");
        setZapatos([]);
        setBolsos([]);
        setImagenesProductos({});
      }
    };

    filtrarYCargarImagenes();
  }, [stock]);


  // Función para obtener la imagen de un producto (usa el idProducto anidado)
  const obtenerImagenProducto = (stockItem) => {
    const idProducto = stockItem.idProducto;
    if (idProducto && imagenesProductos[idProducto]) {
      return imagenesProductos[idProducto];
    }
    return stockItem.imagen || "/iamgenes_prueba/zapato/im6.jpg";
  };

  // Función para manejar favoritos (usa codigoReferencia anidado)
  const toggleFavorito = (stockItem) => {
    const productoRef = stockItem.codigoReferencia;
    if (!productoRef) return; // Validación de seguridad

    if (favoritos.includes(productoRef)) {
      setFavoritos(favoritos.filter(id => id !== productoRef));
      console.log("❌ Eliminado de favoritos:", stockItem.producto.nombreProducto);
    } else {
      setFavoritos([...favoritos, productoRef]);
      console.log("❤️ Agregado a favoritos:", stockItem.nombreProducto);
    }
  };

  const handleAddToCart = async (productoStock) => {


    if ( user && user.rol !== ROL_CLIENTE) {
      alert("Solo los clientes pueden realizar compras.");
      return;
    }

    navigate(`/home/${productoStock.codigoReferencia}`);
    
  };


  


  // Estados de carga y error (sin cambios significativos)
  if (loading) {
    return (
      <div className="allHome" id="home-container">
        <MenuHome />
        <div className="body-color" id="home-body">
          <div className="container text-center text-white py-5">
            <p>Cargando productos e imágenes...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="allHome" id="home-container">
        <MenuHome />
        <div className="body-color" id="home-body">
          <div className="container text-center text-white py-5">
            <p>Error al cargar productos: {error}</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // Componente de tarjeta de producto reutilizable
  const ProductoCard = ({ productoStock, tipo, index }) => {
    // Acceso a propiedades anidadas
    const esFavorito = favoritos.includes(productoStock.codigoReferencia);
    const imagenProducto = obtenerImagenProducto(productoStock);
    const nombreProducto = productoStock.nombreProducto;

    // CORRECCIÓN: Accede a nombrePublico vía producto.tipoPublico.nombrePublico
    const nombrePublico = productoStock.nombrePublico;
    // CORRECCIÓN: Accede a nombreTipoProducto vía producto.categoria.tipoProducto.nombreTipoProducto
    const nombreTipoProducto = productoStock.nombreTipoProducto;

    const precio = productoStock.precio;
    const codigoReferencia = productoStock.codigoReferencia;

    return (
      <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-4"
        id={`home-${tipo}-card-${index + 1}`}>
        <div className="card text-center h-100 home-product-card position-relative"
          id={`home-${tipo}-card-container-${index + 1}`}>

          {/* Botón de corazón (favoritos) */}
          <button
            className="btn btn-link text-decoration-none position-absolute top-0 end-0 p-3"
            onClick={() => toggleFavorito(productoStock)}
            aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
            style={{ zIndex: 2 }}
            id={`home-${tipo}-favorite-btn-${index + 1}`}
          >
            <i className={`bi ${esFavorito ? 'bi-heart-fill text-danger' : 'bi-heart text-white'}`}
              style={{ fontSize: '1.5rem', filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))' }}></i>
          </button>

          {/* Imagen del producto */}
          <div className="producto-imagen-container-home" id={`home-${tipo}-image-container-${index + 1}`}>
            <img
              src={imagenProducto}
              className="card-img-top home-product-image"
              alt={nombreProducto}
              id={`home-${tipo}-image-${index + 1}`}
              onError={(e) => {
                e.target.src = "/iamgenes_prueba/zapato/im6.jpg";
              }}
            />
          </div>

          <div className="card-body home-product-body" id={`home-${tipo}-card-body-${index + 1}`}>
            <h5 className="card-title home-product-title" id={`home-${tipo}-title-${index + 1}`}>
              {nombreProducto}
            </h5>
            {/* Se usan las variables corregidas */}
            <p className="card-text home-product-description" id={`home-${tipo}-description-${index + 1}`}>
              {nombrePublico} - {nombreTipoProducto}
            </p>

            <div className="home-product-hover-text" id={`home-${tipo}-hover-text-${index + 1}`}>
              <p id={`home-${tipo}-hover-price-${index + 1}`}>
                ${precio?.toLocaleString() || 'N/A'}
              </p>
            </div>

            {/* Botón de agregar al carrito */}
            <div className="mt-3">
              <button
                className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleAddToCart(productoStock)}
                id={`home-${tipo}-cart-btn-${index + 1}`}
              >
                <i className="bi bi-cart-plus"></i>
                <span>Agregar al carrito</span>
              </button>
            </div>

            {/* Botón de ver detalles */}
            <div className="mt-2">
              <Link
                className="btn btn-link text-decoration-none text-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                id={`home-${tipo}-details-btn-${index + 1}`}
                to={`/home/${codigoReferencia}`} // Usar códigoReferencia o idProducto si es más conveniente
              >
                <i className="bi bi-eye"></i>
                <span>Ver detalles</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="allHome" id="home-container">
      <MenuHome />
      <div className="body-color" id="home-body">

        <div className="container-fluid" id="home-products-container">

          {/* Sección: Zapatos */}
          <div className="row mt-5" id="home-shoes-section">
            <h1 className="text-center text-white mb-4" id="home-shoes-title">
              Compra por estilos de calzado
            </h1>

            {zapatos.length > 0 ? (
              zapatos.map((zapato, index) => (
                <ProductoCard
                  key={zapato.idStock || index} // Usamos idStock para la key (o un ID único)
                  productoStock={zapato} // Renombrado para claridad
                  tipo="shoe"
                  index={index}
                />
              ))
            ) : (
              !loading && (
                <div className="col-12">
                  <p className="text-white text-center">No hay zapatos disponibles</p>
                </div>
              )
            )}
          </div>

          {/* Sección: Bolsos */}
          <div className="row mt-5" id="home-bags-section">
            <h1 className="text-center text-white mb-4" id="home-bags-title">
              Compra por estilos de bolsos
            </h1>

            {bolsos.length > 0 ? (
              bolsos.map((bolso, index) => (
                <ProductoCard
                  key={bolso.idStock || index} // Usamos idStock para la key (o un ID único)
                  productoStock={bolso} // Renombrado para claridad
                  tipo="bag"
                  index={index}
                />
              ))
            ) : (
              !loading && (
                <div className="col-12">
                  <p className="text-white text-center">No hay bolsos disponibles</p>
                </div>
              )
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}