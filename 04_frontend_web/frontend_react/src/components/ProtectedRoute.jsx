// 📁 components/auth/ProtectedRoute.jsx (versión mejorada)
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem("authToken");
  const userDataStr = localStorage.getItem("userData");
  
  // Si no hay token
  if (!token) {
    return <Navigate to="/loginpage" replace />;
  }
  
  try {
    const userData = JSON.parse(userDataStr);
    const userRol = userData?.rol;
    
    if (!userRol) {
      // Datos corruptos, limpiar y redirigir
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return <Navigate to="/loginpage" replace />;
    }
    
    // Si requiere admin y NO es admin (rol 2)
    if (requireAdmin && userRol !== 2) {
      // Redirigir a página de acceso denegado
      return <Navigate to="/acceso-denegado" replace />;
    }
    
    return children;
    
  } catch (error) {
    // Error al parsear JSON
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    return <Navigate to="/loginpage" replace />;
  }
};

export default ProtectedRoute;