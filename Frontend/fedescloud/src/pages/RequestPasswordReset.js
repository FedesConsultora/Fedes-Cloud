// src/pages/RequestPasswordReset.js
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { requestPasswordResetValidationSchema } from '../validations/authValidation.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { Link } from 'react-router-dom';

const RequestPasswordReset = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(requestPasswordResetValidationSchema),
  });

  const [isRequesting, setIsRequesting] = useState(false);
  const hasRequestedRef = useRef(false); 

  const onSubmit = async (data) => {
    if (hasRequestedRef.current) return; 
    hasRequestedRef.current = true;
    setIsRequesting(true);

    try {
      // Obtener clientURI dinámicamente
      const clientURI = window.location.origin;

      const response = await fetch(`${config.API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, clientURI }), // Incluir clientURI
      });

      console.log('respuesta: ', response);
      const result = await response.json();

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success');
      } else {
        Swal.fire('Error', result.message || 'Error al solicitar el restablecimiento de contraseña', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    } finally {
      setIsRequesting(false);
      hasRequestedRef.current = false; // Resetear la referencia para permitir futuras solicitudes
    }
  };

  return (
    <div className="request-password-reset-page">
      <div className="request-password-reset-container">
        <h2>Solicitar Restablecimiento de Contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="Ingresa tu correo electrónico"
              disabled={isRequesting}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <button type="submit" className="button" disabled={isSubmitting || isRequesting}>
            {isRequesting ? 'Solicitando...' : 'Solicitar Restablecimiento'}
          </button>
        </form>
        <div className="switch-auth">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/auth/login">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;