// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute.js';
import PublicRoute from './components/PublicRoute.js'; // Importa PublicRoute
import AuthPage from './pages/AuthPage.js'; 
import Home from './pages/Home.js';
import ResetPassword from './pages/ResetPassword.js';
import ConfirmEmail from './pages/ConfirmEmail.js';
import MainLayout from './layouts/MainLayout.js'; 
import ThemeToggle from './components/ThemeToggle.js';
import PageTransition from './components/PageTransition.js';
import Profile from './pages/Profile.js'; // Asume que creaste esta página
import Settings from './pages/Settings.js'; // Página que crearemos

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        {/* Rutas públicas: si estás logueado, te manda a / */}
        <Route
          path="/auth/*"
          element={
            <PublicRoute>
              <PageTransition>
                <AuthPage />
              </PageTransition>
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PageTransition>
              <ResetPassword />
            </PageTransition>
          }
        />

        <Route
          path="/confirm-email"
          element={
            <PageTransition>
              <ConfirmEmail />
            </PageTransition>
          }
        />

        {/* Rutas Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <Home />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <Settings />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Redireccionar cualquier otra ruta a / */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeToggle />
      <AppRoutes />
    </Router>
  );
};

export default App;