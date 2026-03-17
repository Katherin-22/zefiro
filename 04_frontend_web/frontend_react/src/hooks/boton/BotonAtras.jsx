import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import "../../styles/home/botonAtras.css";

const BotonAtras = () => {
    const navigate = useNavigate();

    return (
        <Button 
            variant="link" 
            onClick={() => navigate(-1)}
            className=" boton-atras text-decoration-none text-dark mb-3 p-0"
        >
            ← Volver
        </Button>
    );
};

export default BotonAtras;