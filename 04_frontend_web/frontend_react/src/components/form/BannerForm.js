import { useState } from "react";

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
            const response = await fetch("http://localhost:8080/api/banners/upload", {
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
            e.target.reset();
        } catch (err) {
            setError(`Error al subir: ${err.message}`);
            console.error("Error en upload:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center p-3">
            <input
                type="file"
                onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError("");
                }}
                className="form-control mb-3"
                accept="image/*"
            />

            {error && <div className="alert alert-danger mb-3">{error}</div>}

            <button
                type="submit"
                className="btn btn-primary btn-lg rounded-3 shadow"
                disabled={loading || !file}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Subiendo...
                    </>
                ) : (
                    "Subir Banner"
                )}
            </button>
        </form>
    );
};

export default BannerForm;