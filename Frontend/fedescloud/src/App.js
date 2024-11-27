// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.js';
import AuthPage from './pages/AuthPage.js'; // Componente que maneja Login, Register, etc.
import Home from './pages/Home.js';
import ResetPassword from './pages/ResetPassword.js';
import ConfirmEmail from './pages/ConfirmEmail.js';
import MainLayout from './layouts/MainLayout.js'; // Layout para rutas protegidas

import ThemeToggle from './components/ThemeToggle.js';

const App = () => {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* Rutas Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Redireccionar cualquier otra ruta a / */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
