import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import CheckoutForm from "../../components/metodoPagos/CheckoutForm";
import { createPaymentIntent } from "../../services/metodoPagos/paymentApi";
import api_url from "../../services/administrador/api";
import "../../styles/home/paginaInicio.css";
import MenuHome from "../../layouts/home/menuHome";
import Footer from "../../layouts/home/footer";
import "../../styles/metodoPagos/PaymentPage.css"; // Opcional: para estilos


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

const PaymentPage = () => {
    const { token } = useAuth(); // Obtenemos el token JWT del contexto
    const { idUsuario } = useParams();
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(null); 
    const [currency, setCurrency] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    

    // Verificar que idUsuario sea válido
    useEffect(() => {
        console.log("✅ PaymentPage montado");
        console.log("🆔 ID Usuario desde URL:", idUsuario);
        

    }, [idUsuario, navigate]);

    const handleStartPayment = async () => {
        console.log("🚀 Iniciando proceso de pago...");
        console.log("📊 ID Usuario:", idUsuario);
        
        setLoading(true);
        setError(null);
        
        try {
            // Validar ID
            if (!token) {
                throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
            }
            
            console.log("🌐 Llamando a createPaymentIntent...");
            
            // Llamar al backend
            const response = await api_url.post("/api/payments/create",
                {
                    idUsuario: idUsuario,
                    currency: "usd", // o "cop" según tu backend
                    description: "Pago de carrito de compras"
                }, 
                {
                    headers: {
                        // Pasamos el token manualmente SOLO para esta petición
                        Authorization: `Bearer ${token}` 
                    }
                }
            );
            
            console.log("✅ Respuesta del backend recibida:", response.data);
            
            // Verificar que la respuesta tenga los datos necesarios
            if (!response.data.clientSecret) {
                throw new Error("No se recibió clientSecret del servidor");
            }
            
            if (!response.data.amount) {
                throw new Error("No se recibió amount del servidor");
            }
            
            // Actualizar estado
            setClientSecret(response.data.clientSecret);
            setAmount(response.data.amount);
            setCurrency(response.data.currency || "usd");
            setPaymentData(response.data);
            
            console.log("💰 Monto establecido:", response.data.amount);
            console.log("🔑 Client Secret establecido:", response.data.clientSecret.substring(0, 20) + "...");
            
        } catch (err) {
            console.error("❌ Error en handleStartPayment:", err);
            
            // Mostrar mensaje de error detallado
            let errorMessage = "Error al procesar el pago";
            
            if (err.response) {
                // Error del servidor
                console.error("📊 Status:", err.response.status);
                console.error("📄 Data:", err.response.data);
                
                if (err.response.status === 404) {
                    errorMessage = "Usuario no encontrado";
                } else if (err.response.status === 400) {
                    errorMessage = "Datos inválidos: " + (err.response.data.message || "Verifica la información");
                } else if (err.response.status === 500) {
                    errorMessage = "Error interno del servidor";
                } else {
                    errorMessage = `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`;
                }
            } else if (err.request) {
                // No hubo respuesta
                console.error("📡 No response received:", err.request);
                errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
            } else {
                // Error en la configuración
                console.error("⚙️ Config error:", err.message);
                errorMessage = err.message || "Error desconocido";
            }
            
            setError(errorMessage);
            
            // Mostrar alerta
            setTimeout(() => {
                alert(errorMessage);
            }, 100);
            
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount, currency) => {
        if (!amount) return "$0.00";
        const amountInCurrency = amount / 100; // Convertir centavos a unidades
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase() || 'USD'
        }).format(amountInCurrency);
    };

    return (
    <div className="allHome" id="home-container">
      <MenuHome />
      <div className="body-color" id="home-body">      
        <div className="payment-container">
            <h2 className="payment-title">💳 Checkout de Pago</h2>
            
            {/* Panel de información */}
            <div className="info-panel">
                <div className="info-item">
                    <span className="info-label">Estado:</span>
                    <span className={`info-value ${clientSecret ? 'status-success' : 'status-pending'}`}>
                        {clientSecret ? "Listo para pagar" : "Pendiente de iniciar"}
                    </span>
                </div>
            </div>
            
            {/* Mostrar error */}
            {error && (
                <div className="error-message">
                    ⚠️ {error}
                    <button 
                        onClick={() => setError(null)}
                        className="close-error-btn"
                    >
                        ✕
                    </button>
                </div>
            )}
            
            {/* Si no hay clientSecret, mostrar botón para iniciar pago */}
            {!clientSecret && (
                <div className="payment-init-section">
                    <div className="amount-display">
                        <h3>Total Pago</h3>
                        <div className="amount-details">
                            <div className="amount-row">
                                <span>Subtotal:</span>
                                <span>Calculando...</span>
                            </div>
                            <div className="amount-total">
                                <span>Total estimado:</span>
                                <span>Se calculará automáticamente</span>
                            </div>
                            
                        </div>
                        
                        {amount !== null && (
                            <div className="calculated-amount">
                                <span>Total a pagar:</span>
                                <span className="total-amount">
                                    {formatAmount(amount, currency)}
                                </span>
                                <small>Monto calculado desde tu carrito</small>
                            </div>
                        )}
                    </div>
                    
                    <div className="action-buttons">
                        <button
                            onClick={handleStartPayment}
                            disabled={loading}
                            className={`pay-button ${loading ? 'loading' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span className="icon">💳</span>
                                    {amount ? `Pagar ${formatAmount(amount, currency)}` : 'Iniciar Pago'}
                                </>
                            )}
                        </button>
                        
                        <button     
                            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2" id="home-bag-cart-btn-1"
                        >
                            ← Volver al Carrito
                        </button>
                    </div>
                    
                    <div className="payment-info">
                        <p>🔒 Pago seguro procesado por Stripe</p>
                        <p>💳 Aceptamos tarjetas Visa, MasterCard, American Express</p>
                    </div>
                </div>
            )}
            
            {/* Si ya tenemos clientSecret, mostrar formulario de Stripe */}
            {clientSecret && amount && (
                <div className="stripe-section">
                    <div className="payment-summary">
                        <h3>Pago Listo para Completar</h3>
                        <p>Complete los datos de su tarjeta a continuación:</p>
                        <div className="final-amount">
                            <span>Total a pagar:</span>
                            <span className="final-amount-value">
                                {formatAmount(amount, currency)}
                            </span>
                        </div>
                    </div>
                    
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm 
                            clientSecret={clientSecret} 
                            amount={amount}
                            currency={currency}
                            onSuccess={() => {
                                alert("¡Pago exitoso!");
                                navigate("/orden-completada");
                            }}
                            onError={(error) => {
                                setError(error.message);
                            }}
                        />
                    </Elements>
                    
                    <button
                        onClick={() => {
                            setClientSecret("");
                            setAmount(null);
                        }}
                        className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2" id="home-bag-cart-btn-1"
                    >
                        ← Cambiar método de pago
                    </button>
                </div>
            )}
            
        </div>
        <Footer />
        </div>  
        </div>  
    );
};

export default PaymentPage;