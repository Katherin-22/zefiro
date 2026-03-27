import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    console.log("🚪 Cerrando sesión...");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken");
  }, []);

  const getUserData = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem("authToken")?.replace(/"/g, "");
      console.log("📡 getUserData - Token desde localStorage:", storedToken);
      
      if (!storedToken) {
        console.log("⚠️ No hay token en localStorage");
        return;
      }

      const response = await axios.get('http://35.171.131.177:8080/api/usuarios/perfil', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        }
      });

      console.log("✅ getUserData - Respuesta:", response.status);

      if (response.status === 200) {
        let rolValue = null;
        if (response.data.rol) {
          if (typeof response.data.rol === 'object') {
            rolValue = response.data.rol.idRol || response.data.rol.id;
          } else {
            rolValue = response.data.rol;
          }
        }
        
        const updatedUser = {
          ...response.data,
          email: response.data.correoElectronico,
          id: response.data.idUsuario,
          idUsuario: response.data.idUsuario,
          nombre: response.data.nombreUsuario,
          nombreUsuario: response.data.nombreUsuario,
          rol: rolValue,
          idRol: rolValue,
        };
        
        console.log("👤 Usuario actualizado:", updatedUser);
        setUser(updatedUser);
        setIsAuthenticated(true);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("❌ Error al recuperar perfil:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  }, [logout]);

  const checkPersistence = useCallback(() => {
    console.log("🔍 checkPersistence - Iniciando verificación...");
    
    try {
      const storedUser = localStorage.getItem("userData");
      let storedToken = localStorage.getItem("authToken");
      
      console.log("📦 storedUser:", storedUser);
      console.log("🔑 storedToken:", storedToken);

      if (storedUser && storedToken) {
        storedToken = storedToken.replace(/"/g, "");
        const parsedUser = JSON.parse(storedUser);
        
        console.log("✅ Sesión encontrada en localStorage");
        console.log("👤 Usuario parseado (original):", parsedUser);
        
        // ✅ NORMALIZAR el usuario para asegurar que tenga todos los campos
        const userNormalizado = {
          ...parsedUser,
          // Asegurar campos obligatorios (tomar de parsedUser o usar alias)
          idUsuario: parsedUser.idUsuario || parsedUser.id,
          nombreUsuario: parsedUser.nombreUsuario || parsedUser.nombre,
          correoElectronico: parsedUser.correoElectronico || parsedUser.email,
          // Alias para compatibilidad
          id: parsedUser.idUsuario || parsedUser.id,
          nombre: parsedUser.nombreUsuario || parsedUser.nombre,
          email: parsedUser.correoElectronico || parsedUser.email,
          // Asegurar rol
          rol: parsedUser.rol || parsedUser.idRol,
          idRol: parsedUser.idRol || parsedUser.rol,
        };
        
        console.log("👤 Usuario normalizado:", userNormalizado);
        console.log("🔑 Token limpio:", storedToken);
        
        setUser(userNormalizado);
        setToken(storedToken);
        setIsAuthenticated(true);
        return true;
      } else {
        console.log("❌ No hay sesión en localStorage");
        return false;
      }
    } catch (error) {
      console.error("❌ Error parseando datos de persistencia:", error);
      localStorage.clear();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // ✅ useEffect CORREGIDO - Siempre establece isLoading en false
  useEffect(() => {
    console.log("🔄 useEffect de montaje ejecutándose...");
    
    const initAuth = async () => {
      const hasSession = checkPersistence();
      console.log("🔍 hasSession:", hasSession);

      if (hasSession) {
        console.log("🔄 Hay sesión, obteniendo datos frescos...");
        try {
          await getUserData();
        } catch (error) {
          console.error("❌ Error en getUserData:", error);
        }
      }
      
      // ✅ Siempre establecer isLoading en false después de todo
      setIsLoading(false);
      console.log("✅ isLoading establecido a false");
    };
    
    initAuth();

    const handleStorageChange = (e) => {
      console.log("📡 Storage change detected:", e.key);
      if (e.key === 'authToken' || e.key === 'userData') {
        checkPersistence();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getUserData, checkPersistence]);

  const login = (userData, token) => {
    console.log("🔐 LOGIN - Datos recibidos:", { userData, token });
    
    try {
      const cleanToken = token?.replace(/"/g, "");
      
      let rolValue = null;
      if (userData.rol) {
        if (typeof userData.rol === 'object') {
          rolValue = userData.rol.idRol || userData.rol.id;
        } else {
          rolValue = userData.rol;
        }
      }
      
      const userWithAliases = {
        ...userData,
        email: userData.correoElectronico,
        id: userData.idUsuario,
        idUsuario: userData.idUsuario,
        nombre: userData.nombreUsuario,
        nombreUsuario: userData.nombreUsuario,
        rol: rolValue,
        idRol: rolValue,
      };
      
      console.log("💾 Guardando en localStorage:", {
        userData: userWithAliases,
        token: cleanToken
      });
      
      localStorage.setItem("userData", JSON.stringify(userWithAliases));
      localStorage.setItem("authToken", cleanToken);
      
      setUser(userWithAliases);
      setToken(cleanToken);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      console.log("✅ Login completado, estado actualizado");
      
    } catch (error) {
      console.error("❌ Error durante el login:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      userData: user,
      token,
      isAuthenticated,
      isLoading,
      login,
      logout,
      getUserData,
      userId: user?.idUsuario || user?.id,
      userName: user?.nombreUsuario || user?.nombre,
      userEmail: user?.correoElectronico || user?.email
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};