import React, { useEffect, useRef, useState } from 'react'
import logo from "../../../assets/logo.png";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import axios from 'axios';
import "../../../styles/gestionusuarios/EmailVerify.css";


const EmailVerify = () => {
    const inputRef = useRef([]);
    const [loading, setLoading] = useState(false);
    const { getUserData, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { tipo, email } = location.state || {};

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/, "");
        e.target.value = value;
        if (value && index < 5) {
            inputRef.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputRef.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6).split("");
        paste.forEach((digit, i) => {
            if (inputRef.current[i]) {
                inputRef.current[i].value = digit;
            }
        });
        const next = paste.length < 6 ? paste.length : 5;
        inputRef.current[next].focus();
    }

    const handleVerify = async () => {
        const otp = inputRef.current.map(input => input.value).join("");
        if (otp.length !== 6) {
            toast.error("Please enter all 6 digits of the OTP.");
            return;
        }

        setLoading(true);
        try {
            const emailFinal = email || user?.correoElectronico || user?.email;

            if (tipo === "reset") {
                // Flujo para restablecer contraseña
                toast.success("OTP validado correctamente.");
                navigate("/reset-password", {
                    state: { email: emailFinal, otp: otp, step: 'new-password' }
                });
            } else {
                const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
                    correoElectronico: emailFinal,
                    otp
                });

                if (response.status === 200) {
                    toast.success("OTP verified successfully!");
                    await getUserData();
                    navigate("/loginpage");
                } else {
                    toast.error("Invalid OTP");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to verify OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!email && !user?.correoElectronico) {
            navigate("/loginpage");
        }
        isAuthenticated && user && user.isAccountVerified && tipo !== "reset" && navigate("/");
    }, [isAuthenticated, user, navigate, email, tipo]);

    return (
        <div className="email-verify-container">

            <Link to="/" className="auth-logo-link">
                <img src={logo} alt='logo' height={32} width={32} />
                <span className='authify-text'>Zéfiro </span>
            </Link>

            <div className="auth-card">
                <h4> {tipo === "reset" ? "Reset Password OTP" : "Email Verify OTP"} </h4>
                <p>  Enter the 6-digit code sent to your email. </p>

                <div className="otp-inputs-container">
                    {[...Array(6)].map((_, i) => (
                        <input
                            key={i}
                            type='text'
                            maxLength={1}
                            className='otp-input'
                            ref={(el) => (inputRef.current[i] = el)}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            onPaste={handlePaste}

                        />
                    ))}
                </div>

                <button className="btn-auth" disabled={loading} onClick={handleVerify}>
                    {loading ? "Verifying..." : "Verify email"}
                </button>

            </div>

        </div>
    );
};

export default EmailVerify;