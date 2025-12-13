/*-- Bootstrap para react --*/
/*- se descargar con el siguiente comando -- npm install react-bootstrap bootstrap -- -*/

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import './App.css';

import AppRoutes from "./routes/AppRoutes"; 
import { BrowserRouter as Router } from 'react-router-dom';

// Importa AuthProvider para manejar la autenticación en toda la app
import { AuthProvider } from "./hooks/AuthContextx"; // Asegúrate de crear este archivo

/*--- esto es para el manejo de rutas ---*/
function App() {
  return (
    <Router>
      {/* Envuelve toda la app con AuthProvider para que todos los componentes tengan acceso a la autenticación */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;