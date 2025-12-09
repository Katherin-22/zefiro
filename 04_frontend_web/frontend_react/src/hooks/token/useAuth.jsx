    // 📁 hooks/useAuth.js
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userDataStr = localStorage.getItem('userData');
      
      if (token && userDataStr) {
        try {
          const parsedData = JSON.parse(userDataStr);
          setIsAuthenticated(true);
          setUserRole(parsedData.rol);
          setUserData(parsedData);
        } catch (error) {
          // Datos corruptos
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
    window.location.href = '/loginpage';
  };

  const isAdmin = () => {
    return userRole === 2;
  };

  return {
    isAuthenticated,
    userRole,
    userData,
    isLoading,
    logout,
    isAdmin: isAdmin()
  };
};

export default useAuth;