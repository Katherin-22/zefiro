import styles from "../../styles/gestionusuarios/login.module.css"; // <-- CSS Module
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login({ stateOverride }) {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState("");
  const navigate = useNavigate();

  const ROL_CLIENTE = 1;
  const ROL_ADMIN = 2;

  async function handleLogin(event) {
    event.preventDefault();
    setIsError("");
    setMessage("");

    const pendingRedirect = sessionStorage.getItem("pendingCheckoutRedirect");
    const pendingRoleCheck =
      sessionStorage.getItem("requireClientRole") === "true";

    console.log("DEBUG-CHECKOUT: pendingRedirect:", pendingRedirect);
    console.log("DEBUG-CHECKOUT: pendingRoleCheck:", pendingRoleCheck);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.status === 200 && response.data.success === true) {
        const token = response.data.token;
        const userData = response.data.data;

        if (!token || !userData || !userData.rol) {
          setIsError("No se recibió la información del usuario.");
          return;
        }

        let redirectPath = "/";

        // 🔐 PRIORIDAD ABSOLUTA: COMPRA
        if (pendingRoleCheck) {
          // Limpiar intención
          sessionStorage.removeItem("pendingCheckoutRedirect");
          sessionStorage.removeItem("requireClientRole");

          // ⛔ BLOQUEAR ANTES DE LOGIN
          if (userData.rol !== ROL_CLIENTE) {
            setIsError("Solo los clientes pueden realizar compras.");
            return; // ❌ NO LOGIN, NO REDIRECCIÓN
          }

          // ✅ Login permitido
          login(userData, token);
          localStorage.setItem("authToken", token);
          localStorage.setItem("userData", JSON.stringify(userData));

          redirectPath = pendingRedirect || "/carrito";
        }

        // 🔓 LOGIN NORMAL (NO COMPRA)
        else {
          login(userData, token);
          localStorage.setItem("authToken", token);
          localStorage.setItem("userData", JSON.stringify(userData));

          if (userData.rol === ROL_ADMIN) {
            redirectPath = "/Administrador/stock";
          } else {
            redirectPath = "/";
          }
        }

        setMessage(response.data.message || "¡Inicio de sesión exitoso!");
        navigate(redirectPath, { replace: true });
      } else {
        setIsError(response.data.message || "No se pudo iniciar sesión.");
      }
    } catch (err) {
      if (err.response?.status === 401)
        setIsError("Credenciales inválidas.");
      else if (err.response?.status === 404)
        setIsError("El email no está registrado.");
      else if (err.response?.status === 500)
        setIsError("Error del servidor.");
      else setIsError("Error de conexión.");

      console.error("Error login:", err);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.form}>
        <h2 className={styles.title}>BIENVENIDOS A INNOVATION FUSION</h2>

        {isError && (
          <div className={styles.alertDanger} role="alert">
            {isError}
          </div>
        )}

        {message && (
          <div className={styles.alertMessage} role="alert">
            {message}
          </div>
        )}

        <label htmlFor="CorreoElectronico" className={styles.label}>
          Correo Electrónico:
        </label>
        <input
          type="email"
          id="CorreoElectronico"
          className={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="Contraseña" className={styles.label}>
          Contraseña:
        </label>
        <input
          type="password"
          id="Contraseña"
          className={styles.input}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className={styles.opciones}>
          <p>
            <Link to="/recuperarContraseña">¿Olvidó su Contraseña?</Link>
          </p>
        </div>

        <div className={styles.botonInicio}>
          <input
            type="submit"
            className={styles.btn1}
            value="Iniciar sesión"
          />
        </div>

        <div className={styles.registro}>
          <p className={styles.noTienesCuenta}>¿No tienes cuenta?</p>
          <Link
            to="/RegistrarUsuarios"
            className={styles.btnRegistrarse}
          >
            Regístrate
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
