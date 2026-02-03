import { createContext, useContext, useState, useEffect } from "react";

// Creamos el contexto de autenticación para manejar el estado global del usuario
const AuthContext = createContext();

// Proveedor del contexto: Este componente envuelve la aplicación y proporciona acceso al estado de autenticación
export const AuthProvider = ({ children }) => {
  // Estado que almacenará los datos del usuario, inicialmente está vacío (sin usuario)
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect que se ejecuta una sola vez cuando el componente se monta
  // Intenta cargar los datos del usuario desde localStorage si existen
  useEffect(() => {
    const storedUser = localStorage.getItem("userData"); // Recuperamos el usuario desde localStorage
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Si existe, lo parseamos y lo seteamos en el estado
    }
    setIsLoading(false);
  }, []); // La dependencia vacía asegura que esto se ejecute solo una vez al inicio

  // Función para guardar al usuario en el estado y en el localStorage cuando hace login
  const login = (userData) => {
    setUser(userData); // Establecemos el estado del usuario
    localStorage.setItem("userData", JSON.stringify(userData)); // Guardamos los datos del usuario en localStorage
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null); // Limpiamos el estado del usuario
    localStorage.removeItem("userData"); // Eliminamos los datos del usuario de localStorage
    localStorage.removeItem("authToken"); // Eliminamos el token de localStorage también, por seguridad
  };

  return (
    // Proveedor del contexto que pasa los valores del estado y funciones a los componentes hijos
    <AuthContext.Provider value={{ user, login, logout , isLoading}}>
      {children} {/* Renderiza los componentes hijos que estarán dentro de este proveedor */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para utilizar el contexto de autenticación en cualquier parte de la aplicación
export const useAuth = () => useContext(AuthContext); // Retorna el contexto de autenticación