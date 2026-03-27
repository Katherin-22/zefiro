// hooks/carrrousel/carrousel.js
import { useState, useEffect } from "react";
import "../../styles/home/carrousel.css"

const BannerCarousel = ({ banners = [] }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    console.log("🎬 BannerCarousel renderizado");
    console.log("📦 Banners recibidos:", banners);
    console.log("📏 Ancho de ventana:", windowWidth);

    // Detectar cambios en el tamaño de la pantalla
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determinar la altura según el tamaño de pantalla
    const getBannerHeight = () => {
        if (windowWidth < 480) {
            return "200px"; // Móvil pequeño
        } else if (windowWidth >= 480 && windowWidth <= 768) {
            return "300px"; // Móvil grande / Tablet pequeña
        } else if (windowWidth > 768 && windowWidth <= 1024) {
            return "350px"; // Tablet / Laptop pequeña
        } else {
            return "400px"; // Desktop
        }
    };

    // Determinar el objeto-fit según tamaño de pantalla
    const getObjectFit = () => {
        if (windowWidth < 480) {
            return "contain"; // En móvil muy pequeño, mostrar la imagen completa
        } else {
            return "cover"; // En pantallas más grandes, cubrir el espacio
        }
    };

    if (!banners || banners.length === 0) {
        console.log("🚫 No hay banners para mostrar");
        return (
            <div className="text-center p-5 bg-light rounded">
                <h4>No hay banners disponibles</h4>
                <p className="text-muted">
                    Agrega banners desde el panel de administración
                </p>
            </div>
        );
    }

    console.log(`✅ Mostrando ${banners.length} banners`);

    // Altura dinámica basada en el tamaño de pantalla
    const bannerHeight = getBannerHeight();
    const objectFit = getObjectFit();

    return (
        <div id="carouselBanners" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
                {banners.map((banner, index) => {
                    // DEBUG: Mostrar información de cada banner
                    console.log(`   Banner ${index}:`, {
                        id: banner.id,
                        url: banner.url,
                        fileName: banner.fileName,
                        imagenUrl: banner.imagenUrl
                    });

                    // Construir URL CORRECTAMENTE
                    let imageUrl = banner.url || banner.imagenUrl;

                    // Si la URL es relativa, añadir el dominio
                    if (imageUrl && !imageUrl.startsWith('http')) {
                        imageUrl = `http://localhost:8080${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
                    }
                    // Si no hay URL pero sí fileName
                    else if (!imageUrl && banner.fileName) {
                        imageUrl = `http://localhost:8080/uploads/${banner.fileName}`;
                    }

                    console.log(`   URL final ${index}:`, imageUrl);

                    return (
                        <div
                            key={banner.id || index}
                            className={`carousel-item ${index === 0 ? "active" : ""}`}
                        >
                            <img
                                src={imageUrl}
                                className="d-block w-100"
                                alt={banner.titulo || `Banner ${index + 1}`}
                                style={{
                                    height: bannerHeight,
                                    objectFit: objectFit,
                                    backgroundColor: "#f8f9fa"
                                }}
                                onLoad={() => console.log(`✅ Imagen ${index} cargada:`, imageUrl)}
                                onError={(e) => {
                                    console.error(`❌ Error cargando imagen ${index}:`, imageUrl);
                                    e.target.src = "https://via.placeholder.com/1200x400/6c757d/ffffff?text=Imagen+No+Disponible";
                                    e.target.alt = "Imagen no disponible";
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Solo mostrar controles si hay más de 1 banner */}
            {banners.length > 1 && (
                <>
                    <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#carouselBanners"
                        data-bs-slide="prev"
                    >
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                    </button>

                    <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#carouselBanners"
                        data-bs-slide="next"
                    >
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Siguiente</span>
                    </button>
                </>
            )}

            {/* Indicadores solo si hay más de 1 banner */}
            {banners.length > 1 && (
                <div className="carousel-indicators">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            data-bs-target="#carouselBanners"
                            data-bs-slide-to={index}
                            className={index === 0 ? "active" : ""}
                            aria-current={index === 0 ? "true" : "false"}
                            aria-label={`Slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerCarousel;