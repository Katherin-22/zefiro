import { createContext, useContext, useState, useEffect } from "react";

// Creamos el contexto de autenticación para manejar el estado global del usuario
const AuthContext = createContext();

// Proveedor del contexto: Este componente envuelve la aplicación y proporciona acceso al estado de autenticación
export const AuthProvider = ({ children }) => {
  // Estados para manejar la autenticación
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect que se ejecuta una sola vez cuando el componente se monta
  // Intenta cargar los datos del usuario desde localStorage si existen
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("userData");
        const storedToken = localStorage.getItem("authToken");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error al cargar datos de sesión:", error);
        // Si hay error, limpiamos todo para evitar estados inconsistentes
        localStorage.removeItem("userData");
        localStorage.removeItem("authToken");
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // La dependencia vacía asegura que esto se ejecute solo una vez al inicio

  // Función para guardar al usuario en el estado y en el localStorage cuando hace login
  const login = (userData, token) => {
    try {
      // Guardamos en localStorage
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("authToken", token);
      
      // Actualizamos estados
      setUser(userData);
      setToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error durante el login:", error);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiamos localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken");
    
    // Limpiamos estados
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Redirigimos al login
    window.location.href = '/loginpage';
  };

  return (
    // Proveedor del contexto que pasa los valores del estado y funciones a los componentes hijos
    <AuthContext.Provider value={{ 
      user,           // Datos completos del usuario (debe incluir idUsuario)
      token,          // Token de autenticación
      isAuthenticated, // Booleano que indica si está autenticado
      isLoading,      // Estado de carga inicial
      login,          // Función para iniciar sesión
      logout          // Función para cerrar sesión
    }}>
      {children} {/* Renderiza los componentes hijos que estarán dentro de este proveedor */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para utilizar el contexto de autenticación en cualquier parte de la aplicación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};