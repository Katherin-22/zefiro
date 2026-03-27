import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/home/formDireccion.css";
import Footer from "../../layouts/home/footer";
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import BotonAtras from "../../hooks/boton/BotonAtras";
import api_url from '../../services/administrador/api';

function FormDireccion() {
    const { user } = useAuth();
    const userId = user?.id || user?.idUsuario;
    const [formData, setFormData] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    let navigate = useNavigate();

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

            if (userId) {
                navigate(`/api/payments/create/${userId}`);
                setLoading(false);
            } else {
                throw new Error("No se pudo obtener el ID del usuario.");
            }
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
                    <span className="ms-3">Cargando datos...</span>
                </Container>
                <Footer />
            </div>
        );
    }

    if (error && !formData) {
        return (
            <div className="allHome" id="home-container">
                <Container className="py-5">
                    <Alert variant="danger">Error: {error}</Alert>
                </Container>
                <Footer />
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="allHome" id="home-container">
 

            <Container className="py-4 py-md-5 container-form">
                <BotonAtras />
                <Row className="row-form justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <div className="form-direccion bg-white p-3 p-md-4 rounded shadow-sm">
                            <h1 className="text-center text-dir mb-3 mb-md-4">Información de envío</h1>

                            {successMessage && (
                                <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
                                    {successMessage}
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    {/* Fila 1: Nombre y Primer Apellido (2 columnas en md, 1 en móvil) */}
                                    <Col xs={12} md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="nombreUsuario">Nombre:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombreUsuario"
                                                value={formData.nombreUsuario || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="Ingrese su nombre"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="primerApellido">Primer Apellido:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="primerApellido"
                                                value={formData.primerApellido || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="Ingrese su primer apellido"
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Fila 2: Segundo Apellido y Teléfono (2 columnas en md, 1 en móvil) */}
                                    <Col xs={12} md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="segundoApellido">Segundo Apellido:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="segundoApellido"
                                                value={formData.segundoApellido || ''}
                                                onChange={handleChange}
                                                placeholder="Ingrese su segundo apellido"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col xs={12} md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="telefono">Teléfono:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="telefono"
                                                value={formData.telefono || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="Ingrese su teléfono"
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Fila 3: Correo Electrónico (solo 1 columna) */}
                                    <Col xs={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="correoElectronico">Correo Electrónico:</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="correoElectronico"
                                                value={formData.correoElectronico || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="Ingrese su correo electrónico"
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Fila 4: Dirección (solo 1 columna) */}
                                    <Col xs={12}>
                                        <Form.Group className="mb-4">
                                            <Form.Label htmlFor="direccion">Dirección:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="direccion"
                                                value={formData.direccion || ''}
                                                onChange={handleChange}
                                                required
                                                placeholder="Ingrese su dirección"
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Fila 5: Botón (centrado) */}
                                    <Col xs={12} className="text-center">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            variant="primary"
                                            size="lg"
                                            className="px-4 px-md-5 w-100 w-md-auto bton-form"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Guardando...
                                                </>
                                            ) : (
                                                'Comfirmar datos'
                                            )}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>

        </div>
    );
}

export default FormDireccion;