import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../components/metodoPagos/CheckoutForm";
import { createPaymentIntent } from "../../services/metodoPagos/paymentApi";
import { getCartTotal } from "../../services/carrito/carritoApi"; // Necesitarás este servicio

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

const PaymentPage = () => {
    const [cartTotal, setCartTotal] = useState(0); // Total del carrito
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [loadingCart, setLoadingCart] = useState(true);

    // Obtener el total del carrito al cargar la página
    useEffect(() => {
        const fetchCartTotal = async () => {
            try {
                setLoadingCart(true);
                // Suponiendo que tienes el idUsuario en localStorage o contexto
                const idUsuario = localStorage.getItem("userId") || 1; // Ajusta según tu app
                
                // Llama a tu API para obtener el total del carrito
                const response = await getCartTotal(idUsuario);
                setCartTotal(response.data.total); // Ajusta según la estructura de tu respuesta
            } catch (error) {
                console.error("Error al cargar el carrito:", error);
                alert("Error al cargar el carrito. Por favor, recarga la página.");
            } finally {
                setLoadingCart(false);
            }
        };

        fetchCartTotal();
    }, []);

    const handleStartPayment = async () => {
        if (cartTotal <= 0) {
            alert("El carrito está vacío. Agrega productos antes de pagar.");
            return;
        }

        // Convertir a centavos (si tu backend ya lo hace, omite esta línea)
        const convertedAmount = Math.round(cartTotal * 100);
        setLoading(true);

        try {
            // Ya no envías amount desde el frontend, el backend lo calcula
            const res = await createPaymentIntent({ 
                // amount: convertedAmount, // ELIMINA esto - el backend lo calcula
                currency: "cop",
                description: "Pago de carrito de compras"
            });

            setClientSecret(res.data.clientSecret);
            setAmount(convertedAmount);
        } catch (err) {
            console.error("Error al crear el Payment Intent:", err?.response?.data || err.message)
            alert("Error al iniciar el pago. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 480,
                margin: "40px auto",
                padding: 20,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            }}
        >
            <h2>Checkout</h2>
            
            {loadingCart ? (
                <p>Cargando carrito...</p>
            ) : !clientSecret ? (
                <>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                            Resumen del pedido:
                        </label>
                        
                        <div style={{ 
                            background: "#f8f9fa", 
                            padding: 15, 
                            borderRadius: 8,
                            border: "1px solid #e9ecef"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span>Subtotal:</span>
                                <span>${cartTotal.toLocaleString('es-CO')}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span>Envío:</span>
                                <span>$0</span>
                            </div>
                            <hr style={{ margin: "10px 0", borderColor: "#dee2e6" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: "bold" }}>
                                <span>Total a pagar:</span>
                                <span style={{ color: "#28a745" }}>${cartTotal.toLocaleString('es-CO')} COP</span>
                            </div>
                        </div>
                        
                        <p style={{ fontSize: 14, color: "#6c757d", marginTop: 10 }}>
                            El pago se procesará de forma segura a través de Stripe.
                        </p>
                    </div>

                    <button
                        onClick={handleStartPayment}
                        disabled={loading || cartTotal <= 0}
                        style={{
                            width: "100%",
                            padding: 14,
                            background: cartTotal <= 0 ? "#6c757d" : "#635BFF",
                            color: "#fff",
                            fontSize: 16,
                            borderRadius: 8,
                            border: "none",
                            cursor: cartTotal <= 0 ? "not-allowed" : "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        {loading ? "Procesando..." : cartTotal <= 0 ? "Carrito vacío" : "Continuar con el pago"}
                    </button>
                </>
            ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} amount={amount} />
                </Elements>
            )}
        </div>
    );
};

export default PaymentPage;