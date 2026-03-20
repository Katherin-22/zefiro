import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../../assets/logo.png";
import axios from 'axios';
import { toast } from "react-toastify";
import "../../../styles/gestionusuarios/ResetPassword.css"; 

const ResetPassword = () => {

  const inputRef = useRef([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCorreoElectronicoSent, setIsCorreoElectronicoSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

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

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`http://35.171.131.177:8080/api/auth/forgot-password?correoElectronico=${correoElectronico}`);

      if (response.status === 200) {
        toast.success("Password reset OTP sent successfully!");
        setIsCorreoElectronicoSent(true);
      } else {
        toast.error("Something went wrong, please try again.");
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = () => {
    const otpValue = inputRef.current.filter(input => input !== null).map((input) => input.value).join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP.");
      return;
    }

    setOtp(otpValue);
    setIsOtpSubmitted(true);
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 20) {
      toast.error("La contraseña debe tener entre 8 y 20 caracteres.");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      toast.error("Debe incluir mayúsculas, minúsculas, números y símbolos (@#$%^&+=!).");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://35.171.131.177:8080/api/auth/reset-password', {
        correoElectronico,
        otp,
        newPassword
      });

      if (response.status === 200) {
        toast.success("Password reset successfully.");
        navigate("/loginpage")
      } else {
        toast.error("Something  went wrong, please try again.");
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-password-container">

      <Link to="/" className="auth-logo-link">
        <img src={logo} alt="logo" height={32} width={32} />
        <span className='authify-text'>Zéfiro</span>
      </Link>

      {/* Reset password card*/}
      {!isCorreoElectronicoSent && (
        <div className="auth-card">
          <h4>Reset Password</h4>
          <p>Enter your registered email address</p>
          <form onSubmit={onSubmitEmail}>
            <div className="input-pill-wrapper">
              <span className="input-pill-icon">
                <i className="bi bi-envelope "></i>
              </span>

              <input type="email"
                className="input-pill-field"
                placeholder='Enter your email adress'
                onChange={(e) => setCorreoElectronico(e.target.value)}
                value={correoElectronico}
                required
              />
            </div>
            <button className="btn-auth" type='submit'>
              Submit
            </button>
          </form>
        </div>
      )}
      {/* OTP Card */}
      {!isOtpSubmitted && isCorreoElectronicoSent && (

        <div className="auth-card" >
          <h4>Email Verify OTP </h4>
          <p> Enter the 6-digit code sent to your email. </p>

          <div className="otp-inputs-container">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type='text'
                maxLength={1}
                className='otp-field'
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
      )}

      {/* New password form */}
      {isOtpSubmitted && isCorreoElectronicoSent && (
        <div className="auth-card">
          <h4>New Password</h4>
          <p>Enter the new password below</p>
          <form onSubmit={onSubmitNewPassword} >
            <div className="input-pill-wrapper">
              <span className="input-pill-icon">
                <i className="bi bi-person-fill-lock"></i>
              </span>
              <input
                type="password"
                className="input-pill-field"
                placeholder='***********'
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                maxLength={20}
                required
              />
            </div>

            {/* Campo Confirmar Contraseña) */}
            <div className="input-pill-wrapper" style={{ border: "1px solid #dee2e6" }}>
              <span className="input-pill-icon">
                <i className="bi bi-shield-check"></i>
              </span>
              <input
                type="password"
                className="input-pill-field"
                placeholder='Confirm Password'
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                maxLength={20}
                required
              />
            </div>

            <button type='submit' className='btn-auth' disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>

        </div>
      )}
    </div>
  )
}

export default ResetPassword;