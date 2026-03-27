import MenuAdmin from "../../../layouts/administrador/menuAdmin";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/GestionPagina.css"

import { useEffect, useState } from "react";
import BannerForm from "../../../components/form/BannerForm.js";
import BannerCarousel from "../../../hooks/carrrousel/carrousel.js";

const GestionPagina = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar banners al iniciar
    const loadBanners = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:8080/api/banners");
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            setBanners(data);
        } catch (err) {
            setError("Error al cargar los banners: " + err.message);
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    // Manejar subida exitosa
    const handleUpload = (newBanner) => {
        setBanners((prev) => [...prev, newBanner]);
    };

    // Manejar eliminación de banner
    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este banner?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/banners/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            // Actualizar estado local eliminando el banner
            setBanners(banners.filter(banner => banner.id !== id));
            console.log(`✅ Banner ${id} eliminado exitosamente`);
        } catch (error) {
            console.error("Error al eliminar banner:", error);
            alert("Error al eliminar el banner. Intenta nuevamente.");
        }
    };

    // Función para obtener URL completa de la imagen
    const getImageUrl = (url) => {
        if (url.startsWith('http')) return url;
        return `http://localhost:8080${url}`;
    };

    return (
        <div className="all">
            <MenuAdmin />
            <div className="container-fluid container-fluid-gestPag" id='container-admin'>
                <div className="main-content main-gestPag">
                    <div className="container py-4">
                        <h2 className="text-center mb-4 h2-pagGes">Gestión de Banners</h2>

                        {/* Formulario para subir nuevos banners */}
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0 ">Subir Nuevo Banner</h5>
                            </div>
                            <div className="card-body">
                                <BannerForm onUpload={handleUpload} />
                            </div>
                        </div>

                        {/* Carrusel de banners */}
                        <div className="card mb-4">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">Vista Previa del Carrusel</h5>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <p className="mt-2">Cargando banners...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">
                                        <strong>Error:</strong> {error}
                                    </div>
                                ) : banners.length > 0 ? (
                                    <BannerCarousel banners={banners} />
                                ) : (
                                    <div className="alert alert-warning text-center">
                                        No hay banners disponibles. Sube uno nuevo.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lista de banners con opción de eliminar */}
                        <div className="card">
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Banners Activos</h5>
                                <span className="badge bg-light text-dark">{banners.length} banners</span>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm me-2"></div>
                                        Cargando...
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">{error}</div>
                                ) : banners.length === 0 ? (
                                    <div className="text-center py-3 text-muted">
                                        No hay banners subidos aún.
                                    </div>
                                ) : (
                                    <div className="row">
                                        {banners.map((banner) => (
                                            <div key={banner.id} className="col-md-6 col-lg-4 mb-4">
                                                <div className="card h-100 shadow-sm">
                                                    <div className="position-relative">
                                                        <img
                                                            src={getImageUrl(banner.url)}
                                                            alt={banner.titulo || 'Banner'}
                                                            className="card-img-top"
                                                            style={{
                                                                height: '180px',
                                                                objectFit: 'cover',
                                                                width: '100%'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/400x180?text=Imagen+No+Disponible';
                                                                e.target.alt = 'Imagen no disponible';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="card-body d-flex flex-column">
                                                        <div className="mt-3">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <button
                                                                        onClick={() => handleDelete(banner.id)}
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        title="Eliminar banner"
                                                                    >
                                                                        <i className="bi bi-trash me-1"></i> Eliminar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-4 text-center">
                            <div className="alert alert-light border">
                                <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Los banners se muestran en el carrusel en orden de creación.
                                    Puedes eliminar banners antiguos para mantener tu página actualizada.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionPagina;