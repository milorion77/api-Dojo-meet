import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

//importar recursos que son los assets (hojas de estilo, imagenes, fuentes)
import './assets/fonts/fontawesome-free-6.1.2-web/css/all.css';
import './assets/css/normalize.css'; // esto me hace un reset a la hoja de estilio
import './assets/css/styles.css';
import './assets/css/responsive.css';


//esto me arranca la app de react, no olvidar borrar el modo estricto
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
