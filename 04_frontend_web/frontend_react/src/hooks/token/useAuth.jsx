// hooks/useAuth.js - VERSIÓN CORREGIDA (sin intervalo)
import { useState, useEffect } from 'react';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const extractUserId = (data) => {
        if (!data) return null;
        if (data.idUsuario) return data.idUsuario;
        if (data.usuario && data.usuario.idUsuario) return data.usuario.idUsuario;
        if (data.user && data.user.idUsuario) return data.user.idUsuario;
        if (data.cliente && data.cliente.idUsuario) return data.cliente.idUsuario;
        
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

            if (token && userDataStr) {
                try {
                    const parsedData = JSON.parse(userDataStr);
                    const userId = extractUserId(parsedData);
                    
                    const enhancedUserData = {
                        ...parsedData,
                        idUsuario: userId || parsedData.idUsuario
                    };

                    if (!enhancedUserData.idUsuario) {
                        for (const key in enhancedUserData) {
                            if (key.toLowerCase().includes('id') &&
                                typeof enhancedUserData[key] === 'number') {
                                enhancedUserData.idUsuario = enhancedUserData[key];
                                break;
                            }
                        }
                    }

                    setIsAuthenticated(true);
                    setUserRole(enhancedUserData.rol || enhancedUserData.role);
                    setUserData(enhancedUserData);
                } catch (error) {
                    console.error('❌ Error parsing user data:', error);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    setIsAuthenticated(false);
                    setUserData(null);
                }
            } else {
                setIsAuthenticated(false);
                setUserData(null);
            }
            setIsLoading(false);
        };

        checkAuth();

        const handleStorageChange = () => {
            checkAuth();
        };

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

    const login = (token, userData) => {
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
        userId: userData?.idUsuario,
        userName: userData?.nombre || userData?.username,
        userEmail: userData?.email
    };
};

export default useAuth;