import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../components/metodoPagos/CheckoutForm";
import { createPaymentIntent } from "../../services/metodoPagos/paymentApi";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

const PaymentPage =() => {
    const [amountInput, setAmountInput] = useState(""); // user typed amount is USD
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(null); 
    const [loading, setLoading] = useState(false);

    const handleStartPayment = async () => {
        if (!amountInput || isNaN(amountInput) || Number(amountInput) <= 0) {
            alert("Por favor ingrese un monto válido.");
            return;
        }

        const convertedAmount = Math.round(Number(amountInput) * 100); // Convertir a centavos
        setLoading(true);

        try {
            const res = await createPaymentIntent({ 
                amount: convertedAmount,
                currency: "cop",
                description : "custom payment"
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
                boxShadow: "0 6px 24px rgba(0,0,0,08)",

            }}
        >
            <h2>Checkout</h2>
            {!clientSecret && (
                <>
                <label style={{ display: "block", marginBottom: 10 }}>
                    Monto a pagar (USD):
                </label>
                
                <input
                    type="number"
                    placeholder="e.g. 49.99"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    style={{
                        width:"100%",
                        padding: 12,
                        fontSize: 16,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        marginBottom: 20
                    }}
                />

                <button
                    onClick={handleStartPayment}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        background: "#635BFF",
                        color: "#fff",
                        fontSize: 16,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Iniciando pago..." : "Pagar"}
                </button>
                </>
            )}

            {clientSecret && (
                <Elements stripe={stripePromise} options={{clientSecret}}>
                    <CheckoutForm clientSecret={clientSecret} amount={amount} />
                </Elements>
            )}
        </div>
    );
}

export default PaymentPage;