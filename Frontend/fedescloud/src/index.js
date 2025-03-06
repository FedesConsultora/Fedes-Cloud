import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './styles/css/main.css';
import ThemeProvider from './contexts/ThemeContext.js'; // Importar el ThemeProvider
import { AuthProvider } from './contexts/AuthContext.js'; // Importar el AuthProvider
import { CartProvider  } from './contexts/CartContext.js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
            <App />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);