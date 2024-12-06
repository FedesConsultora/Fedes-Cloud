// src/pages/AuthPage.js
import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Login.js';
import Register from './Register.js';
import ResetPassword from './ResetPassword.js';
import ConfirmEmail from './ConfirmEmail.js';
import AuthLayout from '../layouts/AuthLayout.js';
import RequestPasswordReset from './RequestPasswordReset.js';

const AuthPage = () => {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname.includes('register'));

  const toggleAuth = () => {
    setIsRegister((prev) => !prev);
  };

  return (
    <AuthLayout isRegister={isRegister}>
      <Routes>
        <Route
          path="login"
          element={<Login toggleAuth={toggleAuth} />}
        />
        <Route
          path="register"
          element={<Register toggleAuth={toggleAuth} />}
        />
        <Route path="request-password-reset" element={<RequestPasswordReset />}/>
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="confirm-email" element={<ConfirmEmail />} />
        <Route path="*" element={<Navigate to="login" />} />
      </Routes>
    </AuthLayout>
  );
};

export default AuthPage;
