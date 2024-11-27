// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidationSchema } from '../validations/authValidation.js';
import Logo from '../components/Logo.js';

const Login = ({ toggleAuth }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Simulación de inicio de sesión
      const mockToken = '1234567890abcdef';
      await login(mockToken);
      navigate('/');
    } catch (error) {
      // Manejar errores de inicio de sesión
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Logo />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              {...register('email')}
              placeholder="Ingresa tu correo"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              {...register('password')}
              placeholder="Ingresa tu contraseña"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="button">
            Entrar
          </button>
        </form>
        <div className="additional-links">
          <Link to="/auth/reset-password" className="link">
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="switch-auth">
            <p>
              ¿No tienes una cuenta?{' '}
              <a href="#" onClick={toggleAuth}>
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
