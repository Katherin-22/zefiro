import React, {useState}  from "react";
import { useNavigate } from "react-router-dom";
import {useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext"; 

const CheckoutForm = ({clientSecret, amount}) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user, token } = useAuth(); // Obtenemos el usuario y el token
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
        setLoading(true);
        const cardElement = elements.getElement(CardElement);

        const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement }
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
            try {

                const response = await fetch(`http://localhost:8080/api/carrito/checkout/${user.idUsuario}/2`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Enviamos el token para pasar el SecurityConfig
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    setMessage("Pago realizado con éxito.");
                    setTimeout(() => {
                        navigate("/mis-pedidos"); // O la ruta que prefieras
                        }, 3000);
                } else {
                    const errorData = await response.text();
                    setMessage(`Pago aceptado por Stripe, pero hubo un error en el servidor: ${errorData}`);
                }
            } catch (err) {
                setMessage("Error de conexión al registrar el pedido final.");
            }
        } else {
            setMessage(`Payment status: ${paymentIntent?.status}`);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            <div style={{padding: "12px", border: "1px solid #ddd", borderRadius: 8}}>
                <CardElement />
            </div>
        <button disabled={loading} style={{
            background: "#E0B253", color: "#fff", padding: "12px", border: "2px solid #E0B253", borderRadius: 25, cursor: "pointer"
        }}>
            {loading ? "Procesando..." : `Pagar $${(amount / 100).toFixed(2)}`}
        </button>    

        {message && <div style={{marginTop: 8, fontWeight:600}}>{message}</div>}
        </form> 
    );
}

export default CheckoutForm;