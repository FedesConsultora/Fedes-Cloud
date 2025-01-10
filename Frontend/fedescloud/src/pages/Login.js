// src/pages/Login.js

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidationSchema } from '../validations/authValidation.js';
import Logo from '../components/Logo.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import TwoFactorAuth from './TwoFactorAuth.js';

const Login = () => {
  const { login, twoFactorRequired } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const urlTwoFactorRequired = params.get('twoFactorRequired') === 'true';
  const urlTempToken = params.get('tempToken');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  // Estado para manejar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Si venimos desde Google OAuth con twoFactorRequired=true en la URL
    if (urlTwoFactorRequired && urlTempToken) {
      // El login del contexto hará que se muestre el 2FA sin llamar fetchUserProfile aún
      login({ twoFactorRequired: true, tempToken: urlTempToken });
    }
  }, [urlTwoFactorRequired, urlTempToken, login]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        if (result.twoFactorRequired) {
          await login({ twoFactorRequired: true, tempToken: result.tempToken });
        } else {
          await login();
          Swal.fire('Éxito', result.message, 'success').then(() => navigate('/'));
        }
      } else {
        // Manejo de errores del login sin 2FA
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map((err) => `Error: ${err.message}`).join('\n');
          Swal.fire('Errores', errorMessages, 'error');
          result.errors.forEach((err) => {
            setError(err.field, {
              type: 'server',
              message: err.message,
            });
          });
        } else {
          Swal.fire('Error', result.message || 'Error en el inicio de sesión', 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Logo />
        <h2>Iniciar Sesión</h2>
        {/* Si twoFactorRequired es true, mostramos TwoFactorAuth */}
        {!twoFactorRequired ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                {...register('email')}
                placeholder="Ingresa tu correo"
              />
              {errors.email && <span className="error">{errors.email.message}</span>}
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <img
                    src={
                      showPassword
                        ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                        : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                    }
                    alt={showPassword ? 'Ojo abierto' : 'Ojo cerrado'}
                    width="24"
                    height="24"
                  />
                </button>
              </div>
              {errors.password && <span className="error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <TwoFactorAuth />
        )}
        <div className="social-login">
          <p>O inicia sesión con:</p>
          <button
            className="google-button"
            onClick={() =>
              (window.location.href = `${config.API_URL}/auth/google?clientURI=${encodeURIComponent(
                window.location.origin
              )}`)
            }
          >
            <img
              className="google-icon"
              src={`${process.env.PUBLIC_URL}/assets/icons/google-icon.svg`}
              alt="Google Icon"
              width="18"
              height="18"
            />
            <span>Continuar con Google</span>
          </button>
        </div>
        <div className="additional-links">
          <Link to="/auth/request-password-reset" className="link">
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="switch-auth">
            <p>
              ¿No tienes una cuenta? <Link to="/auth/register">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;