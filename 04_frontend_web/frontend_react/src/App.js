/*-- Bootstrap para react --*/
/*- se descargar con el siguiente comando -- npm install react-bootstrap bootstrap -- -*/

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import './App.css';

import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter as Router } from 'react-router-dom';

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./components/carrito/CarritoContext";

import { ToastContainer } from 'react-toastify'; // <---
import 'react-toastify/dist/ReactToastify.css';


/*--- esto es para el manejo de rutas ---*/
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark" 
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
