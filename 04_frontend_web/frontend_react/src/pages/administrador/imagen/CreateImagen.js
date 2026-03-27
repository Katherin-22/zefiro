import MenuAdmin from "../../../layouts/administrador/menuAdmin";
import "../../../styles/administrador/gestion_producto.css";
import "../../../styles/administrador/inventario.css";
import "../../../styles/administrador/CreateImagen.css";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createImagen, getImagenById, deleteImagen } from "../../../services/administrador/ImagenService.js";

const CreateImagen = () => {
    const { idProducto } = useParams();
    const [imagenes, setImagenes] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState(null);

    // Cargar imágenes al iniciar
    const loadImagenes = async () => {
        setLoading(true);
        try {
            const response = await getImagenById(idProducto);
            setImagenes(response.data || []);
        } catch (error) {
            console.error("Error al cargar imagenes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImagenes();
    }, [idProducto]);

    // Previsualización de la imagen seleccionada
    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [file]);

    // Manejar subida de imagen
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Por favor selecciona una imagen antes de subir.");
            return;
        }

        setUploading(true);
        try {
            await createImagen(idProducto, file);
            setSuccess(true);
            await loadImagenes(); // Recargar imágenes
            setFile(null);
            setPreview(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error al crear la imagen:", error);
            if (error.response && error.response.data && error.response.data.errorMessage) {
                alert("⚠️ " + error.response.data.errorMessage);
            } else {
                alert("⚠️ Error desconocido al crear la imagen");
            }
        } finally {
            setUploading(false);
        }
    };

    // Manejar eliminación de imagen
    const handleDelete = async (idImagen) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta imagen?")) {
            return;
        }

        try {
            await deleteImagen(idImagen);
            setImagenes(imagenes.filter(img => img.idImagen !== idImagen));
            alert("✅ Imagen eliminada correctamente");
        } catch (error) {
            if (error.response?.status === 409) {
                alert(error.response.data);
            } else {
                alert("No se pudo eliminar la imagen");
            }
        }
    };

    // Función para obtener URL completa de la imagen
    const getImageUrl = (url) => {
        if (url?.startsWith('http')) return url;
        return `http://35.171.131.177:8080${url || ''}`;
    };

    return (
        <div className="all">
            <MenuAdmin />
            <div className="container-fluid container-fluid-createImg" id='container-admin'>
                <div className="main-content main-createImg">
                    <div className="container py-4">
                        <h2 className="text-center mb-4 h2-createImg">
                            <i className="bi bi-images me-2"></i>
                            Gestión de Imágenes del Producto #{idProducto}
                        </h2>

                        {/* Formulario para subir nuevas imágenes */}
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Subir Nueva Imagen</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleUpload} className="upload-form">
                                    <div className="row align-items-end">
                                        <div className="col-md-8 mb-3 mb-md-0">
                                            <label className="form-label fw-bold">
                                                <i className="bi bi-image me-1"></i>
                                                Seleccionar Imagen
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                onChange={(e) => setFile(e.target.files[0])}
                                                accept="image/*"
                                            />
                                            {preview && (
                                                <div className="mt-3">
                                                    <img 
                                                        src={preview} 
                                                        alt="Vista previa" 
                                                        className="img-preview"
                                                        style={{ maxHeight: '150px', borderRadius: '8px' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger ms-2"
                                                        onClick={() => {
                                                            setFile(null);
                                                            setPreview(null);
                                                        }}
                                                    >
                                                        <i className="bi bi-x-circle"></i> Quitar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-4">
                                            <button
                                                type="submit"
                                                className="btn btn-addB w-100"
                                                disabled={!file || uploading}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                        Subiendo...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cloud-upload me-2"></i>
                                                        Subir Imagen
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                {success && (
                                    <div className="alert alert-success mt-3">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        Imagen subida correctamente
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lista de imágenes con opción de eliminar */}
                        <div className="card">
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-images me-2"></i>
                                    Imágenes del Producto
                                </h5>
                                <span className="badge bg-light text-dark">{imagenes.length} imágenes</span>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm me-2"></div>
                                        Cargando...
                                    </div>
                                ) : imagenes.length === 0 ? (
                                    <div className="text-center py-3 text-muted">
                                        <i className="bi bi-image fs-1 d-block mb-2"></i>
                                        No hay imágenes subidas aún.
                                    </div>
                                ) : (
                                    <div className="row">
                                        {imagenes.map((imagen) => (
                                            <div key={imagen.idImagen} className="col-md-6 col-lg-4 mb-4">
                                                <div className="card h-100 shadow-sm">
                                                    <div className="position-relative">
                                                        <img
                                                            src={getImageUrl(imagen.urlImagen)}
                                                            alt="Imagen producto"
                                                            className="card-img-top"
                                                            style={{
                                                                height: '300px',
                                                                objectFit: 'cover',
                                                                width: '100%'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/400x200?text=Imagen+No+Disponible';
                                                            }}
                                                        />
                                            
                                                    </div>
                                                    <div className="card-body d-flex flex-column">
                                                        <div className="mt-3 d-flex gap-2">
                                                            <Link
                                                                to={`/producto/${idProducto}/imagen/${imagen.idImagen}`}
                                                                className="btn btn-outline-warning btn-sm flex-grow-1"
                                                            >
                                                                <i className="bi bi-pencil me-1"></i> Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(imagen.idImagen)}
                                                                className="btn btn-outline-danger btn-sm flex-grow-1"
                                                                title="Eliminar imagen"
                                                            >
                                                                <i className="bi bi-trash me-1"></i> Eliminar
                                                            </button>
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
                                    Las imágenes se muestran en el orden de subida. 
                                    Puedes eliminar imágenes antiguas para mantener tu producto actualizado.
                                    El producto debe tener al menos una imagen para mostrarse correctamente.
                                </small>
                            </div>
                        </div>

                        {/* Botón para volver */}
                        <div className="mt-3 text-center">
                            <Link to="/ver_producto" className="btn btn-outline-secondary">
                                <i className="bi bi-arrow-left me-2"></i>
                                Volver a Productos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateImagen;