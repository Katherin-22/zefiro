import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. IMPORTAR el service worker
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 2. REGISTRAR el Service Worker (AGREGA ESTO)
serviceWorkerRegistration.register();

// Si quieres notificaciones cuando se actualice:
serviceWorkerRegistration.register({
   onUpdate: registration => {
     if (window.confirm('Hay una nueva versión disponible. ¿Recargar?')) {
       window.location.reload();
     }
   }
 });

// 3. Mantén esto si lo necesitas
reportWebVitals();