// src/pages/ResetPassword.js

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPasswordValidationSchema } from '../validations/authValidation.js';
import config from '../config/config.js';
import Logo from '../components/Logo.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(resetPasswordValidationSchema),
    defaultValues: {
      email: email || '',
    },
  });

  const [status, setStatus] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasSubmittedRef = useRef(false); 

  // Estados para manejar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para la validación en tiempo real
  const [passwordValidations, setPasswordValidations] = useState({
    min: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const password = watch('password', '');

  useEffect(() => {
    // Actualizar las validaciones en tiempo real
    setPasswordValidations({
      min: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  }, [password]);

  

  const onSubmit = async (data) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setStatus('submitting');

    try {
      const response = await fetch(`${config.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: data.email,
          password: data.password,
        }),
      });

      console.log('respuesta: ', response);
      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
      } else {
        setStatus('error');

        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map((err) => `Error: ${err.message}`).join('\n');
          Swal.fire('Error', errorMessages, 'error');

          const tokenExpiredError = result.errors.find((err) =>
            err.message.toLowerCase().includes('expirado')
          );

          if (tokenExpiredError) {
            setTokenExpired(true);
          }
        } else {
          Swal.fire('Error', result.message || 'Error al restablecer la contraseña', 'error');
        }
      }
    } catch (error) {
      setStatus('error');
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch(`${config.API_URL}/auth/resend-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, clientURI: window.location.origin }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
      } else {
        Swal.fire('Error', result.message || 'Error al reenviar restablecimiento de contraseña', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    } finally {
      setIsResending(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <Logo />
          <h2>Enlace Inválido</h2>
          <p>
            El enlace para restablecer la contraseña es inválido o ha expirado. Por favor, solicita un nuevo{' '}
            <Link to="/auth/request-password-reset">restablecimiento de contraseña</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <Logo />
        <h2>Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('token')} value={token} />
          <input type="hidden" {...register('email')} value={email} />

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="Ingresa tu correo"
              disabled
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                placeholder="Ingresa tu nueva contraseña"
                disabled={isSubmitting || tokenExpired}
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
            {/* Validación en tiempo real */}
            <ul className="password-validations">
              <li className={passwordValidations.min ? 'valid' : ''}>
                {passwordValidations.min ? '✔️' : '❌'} Al menos 8 caracteres
              </li>
              <li className={passwordValidations.lowercase ? 'valid' : ''}>
                {passwordValidations.lowercase ? '✔️' : '❌'} Al menos una letra minúscula
              </li>
              <li className={passwordValidations.uppercase ? 'valid' : ''}>
                {passwordValidations.uppercase ? '✔️' : '❌'} Al menos una letra mayúscula
              </li>
              <li className={passwordValidations.number ? 'valid' : ''}>
                {passwordValidations.number ? '✔️' : '❌'} Al menos un número
              </li>
              <li className={passwordValidations.specialChar ? 'valid' : ''}>
                {passwordValidations.specialChar ? '✔️' : '❌'} Al menos un carácter especial (@, $, !, %, *, ?, &)
              </li>
            </ul>
          </div>

          <div className="form-group password-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword')}
                placeholder="Confirma tu nueva contraseña"
                disabled={isSubmitting || tokenExpired}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <img
                  src={
                    showConfirmPassword
                      ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                      : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                  }
                  alt={showConfirmPassword ? 'Ojo abierto' : 'Ojo cerrado'}
                  width="24"
                  height="24"
                />
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="button" disabled={isSubmitting || tokenExpired}>
            {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        {status === 'error' && tokenExpired && (
          <div className="resend-section">
            <p>El token de restablecimiento ha expirado.</p>
            <button onClick={handleResend} disabled={isResending} className="resend-button">
              {isResending ? 'Reenviando...' : 'Reenviar Correo de Restablecimiento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
