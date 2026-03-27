import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext";

const CheckoutForm = ({ clientSecret, amount, idUsuario }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!stripe || !elements) {
            setMessage("Stripe no está cargado aún.");
            return;
        }

        if (!idUsuario || idUsuario === "undefined") {
            setMessage("Error: No se detectó un ID de usuario válido. Por favor, regresa al carrito.");
            return;
        }

        setLoading(true);
        const cardElement = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement }
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                // ✅ SOLO UNA VEZ - Llamar al checkout
                const response = await fetch(`http://35.171.131.177:8080/api/carrito/checkout/${idUsuario}/1`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessage("✅ Pago realizado con éxito. Redirigiendo...");

                    // ✅ Redirigir al ticket con el ID del pedido
                    setTimeout(() => {
                        navigate(`/ticket/${data.idPedido}`);
                    }, 2000);

                } else {
                    const errorData = await response.json();
                    setMessage(`❌ Pago aceptado por Stripe, pero hubo un error en el servidor: ${JSON.stringify(errorData)}`);
                    setLoading(false);
                }

            } catch (err) {
                console.error("Error en checkout:", err);
                setMessage("❌ Error de conexión al registrar el pedido final.");
                setLoading(false);
            }
        } else {
            setMessage(`Payment status: ${paymentIntent?.status}`);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "12px", border: "1px solid #ddd", borderRadius: 8 }}>
                <CardElement />
            </div>
            <button disabled={loading} style={{
                background: "#E0B253",
                color: "#fff",
                padding: "12px",
                border: "2px solid #E0B253",
                borderRadius: 25,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
            }}>
                {loading ? "Procesando..." : `Pagar $${(amount / 100).toFixed(2)}`}
            </button>

            {message && (
                <div style={{
                    marginTop: 8,
                    fontWeight: 600,
                    color: message.includes('✅') ? '#28a745' : message.includes('❌') ? '#dc3545' : '#000'
                }}>
                    {message}
                </div>
            )}
        </form>
    );
}

export default CheckoutForm;