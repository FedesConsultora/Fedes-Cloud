// src/pages/ResetPassword.js
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import config from '../config/config.js';
import Logo from '../components/Logo.js';
import { resetPasswordValidationSchema } from '../validations/authValidation.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');
  const action = query.get('action'); // Si action === 'update', es cambio de contraseña estando logueado
  const id = query.get('id'); // id_usuario, necesario en el flujo update

  const [status, setStatus] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasSubmittedRef = useRef(false);

  // Estados para controlar la visibilidad de los inputs de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // En el flujo de recuperación se muestra el formulario
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(resetPasswordValidationSchema),
    defaultValues: { email: email || '' },
  });

  const password = watch('password', '');

  // Efecto para el flujo "update": si action === 'update' y tenemos token e id, se confirma automáticamente el cambio de contraseña.
  useEffect(() => {
    if (action === 'update' && token && id) {
      const confirmChange = async () => {
        try {
          const response = await fetch(
            `${config.API_URL}/auth/confirm-password-change?token=${token}&id=${id}&action=update`,
            { method: 'GET', credentials: 'include' }
          );
          const result = await response.json();
          if (response.ok) {
            setStatus('success');
            // Muestra el mensaje de éxito y espera 2 segundos antes de redireccionar
            Swal.fire({
              title: 'Éxito',
              text: result.message,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              // Forzamos la redirección a login tras 2 segundos
              window.location.replace(`${window.location.origin}/auth/login`);
            });
          } else {
            setStatus('error');
            Swal.fire('Error', result.message || 'Error en la confirmación del cambio de contraseña', 'error');
          }
        } catch (error) {
          setStatus('error');
          Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
          console.error(error);
        }
      };
      confirmChange();
    }
  }, [action, token, id]);

  // Función para enviar el formulario en el flujo de recuperación
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
      const result = await response.json();
      if (response.ok) {
        setStatus('success');
        Swal.fire('Éxito', result.message, 'success').then(() =>
          navigate('/auth/login')
        );
      } else {
        setStatus('error');
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors
            .map((err) => `Error: ${err.message}`)
            .join('\n');
          Swal.fire('Error', errorMessages, 'error');
          const tokenExpiredError = result.errors.find((err) =>
            err.message.toLowerCase().includes('expirado')
          );
          if (tokenExpiredError) setTokenExpired(true);
        } else {
          Swal.fire(
            'Error',
            result.message || 'Error al restablecer la contraseña',
            'error'
          );
        }
      }
    } catch (error) {
      setStatus('error');
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    }
  };

  // Función para reenviar el correo de restablecimiento (usado en ambos flujos)
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
        Swal.fire('Éxito', result.message, 'success').then(() =>
          navigate('/auth/login')
        );
      } else {
        Swal.fire(
          'Error',
          result.message || 'Error al reenviar restablecimiento de contraseña',
          'error'
        );
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    } finally {
      setIsResending(false);
    }
  };

  // Si no existe token, mostramos un mensaje de enlace inválido
  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <Logo />
          <h2>Enlace Inválido</h2>
          <p>
            El enlace es inválido o ha expirado. Por favor, solicita un nuevo{' '}
            <Link to="/auth/request-password-reset">restablecimiento de contraseña</Link>.
          </p>
        </div>
      </div>
    );
  }

  // Si es flujo "update" (cambio de contraseña estando logueado),
  // no mostramos el formulario y dejamos que el useEffect confirme el cambio.
  if (action === 'update' && token && id) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          {status === null && <p>Confirmando el cambio de contraseña...</p>}
          {status === 'success' && <p>Cambio de contraseña confirmado.</p>}
          {status === 'error' && <p>Error en la confirmación del cambio de contraseña.</p>}
        </div>
      </div>
    );
  }

  // Flujo de recuperación: mostramos el formulario para restablecer la contraseña
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
            <label htmlFor="password">
              {action === 'update' ? 'Nueva Contraseña' : 'Nueva Contraseña'}
            </label>
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
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || tokenExpired}
              >
                <img
                  src={
                    showPassword
                      ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                      : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                  }
                  alt={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  width="24"
                  height="24"
                />
              </button>
            </div>
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>
          <div className="form-group password-group">
            <label htmlFor="confirmPassword">
              Confirmar {action === 'update' ? 'Nueva Contraseña' : 'Contraseña'}
            </label>
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || tokenExpired}
              >
                <img
                  src={
                    showConfirmPassword
                      ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                      : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                  }
                  alt={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  width="24"
                  height="24"
                />
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
          </div>
          <button type="submit" className="button" disabled={isSubmitting || tokenExpired}>
            {isSubmitting
              ? action === 'update'
                ? 'Confirmando...'
                : 'Restableciendo...'
              : action === 'update'
              ? 'Confirmar Cambio de Contraseña'
              : 'Restablecer Contraseña'}
          </button>
        </form>
        {status === 'error' && tokenExpired && (
          <div className="resend-section">
            <p>El token ha expirado.</p>
            <button onClick={handleResend} disabled={isResending} className="resend-button">
              {isResending ? 'Reenviando...' : 'Reenviar Correo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
