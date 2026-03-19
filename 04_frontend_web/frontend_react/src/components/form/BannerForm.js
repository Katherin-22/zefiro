import { useState } from "react";
import "../../styles/administrador/GestionPagina.css"

const BannerForm = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Por favor selecciona un archivo");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://35.171.131.177:8080/api/banners/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            onUpload(data);
            setFile(null);

            // Resetear el input file
            const fileInput = e.target.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = "";

            // Mostrar mensaje de éxito
            alert("✅ Banner subido exitosamente");
        } catch (err) {
            setError(`Error al subir: ${err.message}`);
            console.error("Error en upload:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center p-3">
            <div className="mb-3 w-100">
                <label htmlFor="bannerFile" className="form-label fw-bold">
                    Seleccionar imagen para banner:
                </label>
                <input
                    id="bannerFile"
                    type="file"
                    onChange={(e) => {
                        setFile(e.target.files[0]);
                        setError("");
                    }}
                    className="form-control"
                    accept="image/*"
                    disabled={loading}
                />
                <div className="form-text">
                    Formatos aceptados: JPG, PNG, GIF, WebP. Tamaño máximo recomendado: 10MB.
                </div>
            </div>

            {file && (
                <div className="alert alert-info w-100">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-file-earmark-image me-2"></i>
                        <div>
                            <strong>Archivo seleccionado:</strong> {file.name}
                            <br />
                            <small>Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger w-100 mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-addB btn-primary btn-lg rounded-3 shadow px-5"
                disabled={loading || !file}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Subiendo...
                    </>
                ) : (
                    <>
                        <i className="bi bi-add bi-cloud-arrow-up me-2"></i>
                        Subir Banner
                    </>
                )}
            </button>
        </form>
    );
};

export default BannerForm;