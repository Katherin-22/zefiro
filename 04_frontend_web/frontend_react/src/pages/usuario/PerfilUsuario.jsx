import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../styles/gestionusuarios/perfilusuario.css";
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import BotonAtras from '../../hooks/boton/BotonAtras';
import api_url from '../../services/administrador/api';

function PerfilUsuario() {
    const [formData, setFormData] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- A. Obtención de Datos (GET) ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("authToken")?.replace(/"/g, "");

                if (!token) {
                    setError("No se encontró el token de autenticación. Inicie sesión.");
                    setLoading(false);
                    return;
                }

                const response = await api_url.get('/api/usuarios/perfil', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                setFormData(response.data);
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
                setError("No se pudo cargar el perfil del usuario. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    // --- B. Manejo de Cambios en el Formulario ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password') {
            setNewPassword(value);
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
        setSuccessMessage('');
        setError(null);
    };

    // --- C. Manejo del Envío (PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setError(null);

        const token = localStorage.getItem("authToken")?.replace(/"/g, "");

        if (!token) {
            setError("No se encontró el token de autenticación para actualizar. Inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const requestData = {
                ...formData,
                password: newPassword || null,
                rol: undefined,
                tipo_de_documento: undefined,
                estado_usuario: undefined,
            };

            await api_url.put('/api/usuarios/perfil', requestData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            setSuccessMessage("¡Perfil actualizado con éxito!");
            setLoading(false);
            setNewPassword('');

        } catch (err) {
            console.error("Error al actualizar:", err);
            setError("Error al actualizar el perfil. Revisa los datos.");
            setLoading(false);
        }
    };

    // --- D. Lógica de Renderizado ---
    if (loading && !formData) {
        return (
            <div className="allHome" id="home-container">
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-3">Cargando perfil... 🔄</span>
                </Container>
            </div>
        );
    }

    if (error && !formData) {
        return (
            <div className="allHome" id="home-container">
                <Container className="py-5">
                    <Alert variant="danger">Error: {error}</Alert>
                </Container>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="allHome" id="home-container">
            <Container className="py-4 py-md-5">
                <BotonAtras />

                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        {/* Tus classnames originales se mantienen */}
                        <div className="user-profile-container">
                            <h1>Editar Mi Perfil</h1>

                            {successMessage && <div className="success-message">{successMessage}</div>}
                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleSubmit} className="profile-form">
                                <Row>
                                    <Col xs={12} md={6}>
                                        <div className="form-group">
                                            <label htmlFor="nombreUsuario">Nombre:</label>
                                            <input
                                                type="text"
                                                name="nombreUsuario"
                                                value={formData.nombreUsuario || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <div className="form-group">
                                            <label htmlFor="primerApellido">Primer Apellido:</label>
                                            <input
                                                type="text"
                                                name="primerApellido"
                                                value={formData.primerApellido || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <div className="form-group">
                                            <label htmlFor="segundoApellido">Segundo Apellido:</label>
                                            <input
                                                type="text"
                                                name="segundoApellido"
                                                value={formData.segundoApellido || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <div className="form-group">
                                            <label htmlFor="telefono">Teléfono:</label>
                                            <input
                                                type="text"
                                                name="telefono"
                                                value={formData.telefono || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12}>
                                        <div className="form-group">
                                            <label htmlFor="correoElectronico">Correo Electrónico:</label>
                                            <input
                                                type="email"
                                                name="correoElectronico"
                                                value={formData.correoElectronico || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12}>
                                        <div className="form-group">
                                            <label htmlFor="direccion">Dirección:</label>
                                            <input
                                                type="text"
                                                name="direccion"
                                                value={formData.direccion || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <div className="form-group">
                                            <label htmlFor="numeroDocumento">Número de Documento:</label>
                                            <input
                                                type="number"
                                                name="numeroDocumento"
                                                value={formData.numeroDocumento || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <div className="form-group password-group">
                                            <label htmlFor="password">Nueva Contraseña (Opcional):</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={newPassword}
                                                onChange={handleChange}
                                                placeholder="Dejar vacío para no cambiarla"
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={12}>
                                        <div className="read-only-info">
                                            <p>
                                                <strong>Tipo de Documento:</strong> {formData.tipo_de_documento?.nombreTipoDeDocumento || 'N/A'}
                                            </p>
                                        </div>
                                    </Col>

                                    <Col xs={12} className="text-center">
                                        <button className="bton-actualizar" type="submit" disabled={loading}>
                                            {loading ? 'Guardando...' : 'Actualizar Perfil'}
                                        </button>
                                    </Col>
                                </Row>
                            </form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default PerfilUsuario;