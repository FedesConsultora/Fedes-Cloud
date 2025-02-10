// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute.js';
import PublicRoute from './components/PublicRoute.js';
import AuthPage from './pages/AuthPage.js';
import Home from './pages/Home.js';
import ResetPassword from './pages/ResetPassword.js';
import ConfirmEmail from './pages/ConfirmEmail.js';
import MainLayout from './layouts/MainLayout.js';
import ThemeToggle from './components/ThemeToggle.js';
import PageTransition from './components/PageTransition.js';
import Profile from './pages/Profile.js';
import Settings from './pages/Settings.js';
import TwoFactorAuth from './pages/TwoFactorAuth.js';
import DominiosPage from './pages/DominiosPage.js';
import DominiosBusquedaPage from './pages/DominiosBusquedaPage.js';
import CertificadosSSLPage from './pages/CertificadosSSLPage.js';
import AdminRoute from './components/AdminRoute.js';
import UserDetail from './pages/UserDetail.js';
import DomainDetail from './pages/DomainDetail.js';
import AdminDashboard from './pages/AdminDashboard.js';
import EditUserPage from './pages/EditUserPage.js';
import EditDomainPage from './pages/EditDomainPage.js';
import ComprarPage from './pages/ComprarPage.js';
import UserPage from './pages/UserPage.js';
import BillingDetails from './pages/BillingDetails.js';
import ContactDetails from './pages/ContactDetails.js';
import UserManagement from './pages/UserManagement.js';
import AcceptInvitation from './pages/AcceptInvitation.js';
import Accounts from './pages/Accounts.js'; 

const AppRoutes = () => {
  const location = useLocation();

  return (
    <div className="transition-container">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Rutas públicas */}
          <Route
            path="/auth/*"
            element={
              <PublicRoute>
                <AuthPage />
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
          <Route
            path="/invite/accept"
            element={
              <PageTransition>
                <AcceptInvitation />
              </PageTransition>
            }
          />

          {/* Rutas protegidas */}
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

          {/* Rutas de Usuario */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <UserPage />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="contact" element={<ContactDetails />} />
            <Route path="billing" element={<BillingDetails />} />
            <Route path="management" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="/user/profile" replace />} />
          </Route>

          {/* Nueva ruta para "Cuentas" (accesos a cuentas padre) */}
          <Route
            path="/cuentas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <Accounts />
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

          <Route
            path="/two-factor-auth"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <TwoFactorAuth />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dominios"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <DominiosPage />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dominios/busqueda"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <DominiosBusquedaPage />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dominios/comprar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <ComprarPage />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificados-ssl"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <CertificadosSSLPage />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas para Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <MainLayout>
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </MainLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <AdminRoute>
                <MainLayout>
                  <PageTransition>
                    <UserDetail />
                  </PageTransition>
                </MainLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:userId/edit"
            element={
              <AdminRoute>
                <MainLayout>
                  <PageTransition>
                    <EditUserPage />
                  </PageTransition>
                </MainLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/domains/:domainId/edit"
            element={
              <AdminRoute>
                <MainLayout>
                  <PageTransition>
                    <EditDomainPage />
                  </PageTransition>
                </MainLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/domains/:domainId"
            element={
              <AdminRoute>
                <MainLayout>
                  <PageTransition>
                    <DomainDetail />
                  </PageTransition>
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
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
