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

  useEffect(() => {
    if (!token || !email) {
      setStatus('invalid');
      Swal.fire('Error', 'Token o email faltante en la URL', 'error').then(() => navigate('/auth/login'));
    }
  }, [token, email, navigate]);

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
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              placeholder="Ingresa tu nueva contraseña"
              disabled={isSubmitting || tokenExpired}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="Confirma tu nueva contraseña"
              disabled={isSubmitting || tokenExpired}
            />
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