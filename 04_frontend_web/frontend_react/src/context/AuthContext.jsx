import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Creamos el contexto de autenticación para manejar el estado global del usuario
const AuthContext = createContext();

// Proveedor del contexto: Este componente envuelve la aplicación y proporciona acceso al estado de autenticación
export const AuthProvider = ({ children }) => {
  // Estado que almacenará los datos del usuario, inicialmente está vacío (sin usuario)
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    setUser(null); // Limpiamos el estado del usuario
    setToken(null); // Al actualizar el estado, React avisa a todos los componentes
    localStorage.removeItem("userData"); // Eliminamos los datos del usuario de localStorage
    localStorage.removeItem("authToken"); // Eliminamos el token de localStorage también, por seguridad
  }, []);


  // Función para obtener datos frescos del perfil desde el backend
  const getUserData = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("authToken")?.replace(/"/g, "");
      if (!storedToken) return;

      const response = await axios.get('http://localhost:8080/api/usuarios/perfil', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        }
      });

      if (response.status === 200) {
        const updatedUser = {
        ...response.data,
        email: response.data.correoElectronico // Creamos el alias para que no se pierda
      };
        setUser(updatedUser);
        localStorage.setItem("userData", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error al recuperar perfil:", error);
      // Si el servidor dice que el token no vale (401 o 403), cerramos sesión
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }

    }
  }, [logout]);

  // checkPersistence que se ejecuta una sola vez cuando el componente se monta
  // Intenta cargar los datos del usuario desde localStorage si existen

  const checkPersistence = useCallback(() => {
    const storedUser = localStorage.getItem("userData");  // Recuperamos el usuario desde localStorage
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Si existe, lo parseamos y lo seteamos en el estado
        setToken(storedToken); // Seteamos el token en el estado
        return true;
      } catch (error) {
        console.error("Error parseando datos de persistencia:", error);
        localStorage.clear();
        return false;
      }
    }
    return false;
  }, []); // La dependencia vacía asegura que esto se ejecute solo una vez al inicio

  // --- EFECTO DE MONTAJE (AL RECARGAR PAGINA) ---
  useEffect(() => {
    const hasSession = checkPersistence();

    if (hasSession) {
      // Si hay sesión en localStorage, pedimos datos frescos al servidor en segundo plano
      getUserData();
    }

    setIsLoading(false);

    //  Escuchar cambios en otras pestañas (o si el storage cambia)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        checkPersistence();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getUserData, checkPersistence]);

  // Función para guardar al usuario en el estado y en el localStorage cuando hace login
  const login = (userData, token) => {
    setUser(userData); // Establecemos el estado del usuario
    setToken(token); // Al actualizar el estado, React avisa a todos los componentes
    localStorage.setItem("userData", JSON.stringify(userData)); // Guardamos los datos del usuario en localStorage
    localStorage.setItem("authToken", token); // <--- NUEVO
  };

  return (
    // Proveedor del contexto que pasa los valores del estado y funciones a los componentes hijos
    <AuthContext.Provider value={{ user, userData: user, userId: user?.idUsuario || user?.id, userName: user?.nombreUsuario || user?.nombre, userEmail: user?.correoElectronico, token, isAuthenticated: !!token, login, logout, isLoading, getUserData }}>
      {children} {/* Renderiza los componentes hijos que estarán dentro de este proveedor */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para utilizar el contexto de autenticación en cualquier parte de la aplicación
export const useAuth = () => useContext(AuthContext); // Retorna el contexto de autenticación