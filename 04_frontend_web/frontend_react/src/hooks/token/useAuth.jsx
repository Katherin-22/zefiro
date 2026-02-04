// hooks/useAuth.js - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const extractUserId = (data) => {
    // Busca idUsuario en diferentes lugares posibles
    if (!data) return null;
    
    // 1. Directamente en data
    if (data.idUsuario) return data.idUsuario;
    
    // 2. En data.usuario
    if (data.usuario && data.usuario.idUsuario) return data.usuario.idUsuario;
    
    // 3. En data.user
    if (data.user && data.user.idUsuario) return data.user.idUsuario;
    
    // 4. En data.cliente
    if (data.cliente && data.cliente.idUsuario) return data.cliente.idUsuario;
    
    // 5. Busca cualquier propiedad que contenga "id" e "Usuario"
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        if (data[key].idUsuario) return data[key].idUsuario;
      }
    }
    
    return null;
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      console.log('🔄 useAuth checking...');
      console.log('Token exists:', !!token);
      console.log('userDataStr exists:', !!userDataStr);
      
      if (token && userDataStr) {
        try {
          const parsedData = JSON.parse(userDataStr);
          console.log('📋 Parsed userData:', parsedData);
          
          // Extrae el idUsuario
          const userId = extractUserId(parsedData);
          console.log('🔑 Extracted userId:', userId);
          
          // Crea un objeto userData con idUsuario garantizado
          const enhancedUserData = {
            ...parsedData,
            idUsuario: userId || parsedData.idUsuario
          };
          
          // Si no tiene idUsuario, lo intentamos extraer de otro modo
          if (!enhancedUserData.idUsuario) {
            // Intenta encontrar cualquier ID numérico
            for (const key in enhancedUserData) {
              if (key.toLowerCase().includes('id') && 
                  typeof enhancedUserData[key] === 'number') {
                enhancedUserData.idUsuario = enhancedUserData[key];
                console.log('⚠️ Usando', key, 'como idUsuario:', enhancedUserData[key]);
                break;
              }
            }
          }
          
          setIsAuthenticated(true);
          setUserRole(enhancedUserData.rol || enhancedUserData.role);
          setUserData(enhancedUserData);
          
          console.log('✅ Auth check passed. userId:', enhancedUserData.idUsuario);
          console.log('✅ UserData final:', enhancedUserData);
          
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setIsAuthenticated(false);
          setUserData(null);
        }
      } else {
        console.log('❌ No token or user data found');
        setIsAuthenticated(false);
        setUserData(null);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      console.log('📢 Storage changed');
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También verificar periódicamente
    const interval = setInterval(checkAuth, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
    window.location.href = '/loginpage';
  };

  const login = (token, userData) => {
    console.log('🔐 Login called with:', { token, userData });
    
    // Asegúrate de que userData tenga idUsuario
    const userId = extractUserId(userData);
    const enhancedUserData = {
      ...userData,
      idUsuario: userId
    };
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(enhancedUserData));
    
    setIsAuthenticated(true);
    setUserRole(enhancedUserData.rol || enhancedUserData.role);
    setUserData(enhancedUserData);
    
    console.log('✅ Login successful. userId:', userId);
  };

  const isAdmin = () => {
    return userRole === 2 || userRole === 'ADMIN';
  };

  return {
    isAuthenticated,
    userRole,
    userData,
    isLoading,
    login,
    logout,
    isAdmin: isAdmin(),
    // Propiedades directas para fácil acceso
    userId: userData?.idUsuario,
    userName: userData?.nombre || userData?.username,
    userEmail: userData?.email
  };
};

export default useAuth;