// src/pages/ResetPassword.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPasswordValidationSchema } from '../validations/authValidation.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
      } else {
        Swal.fire('Error', result.message || 'Error en el restablecimiento de contraseña', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2>Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              placeholder="Ingresa tu nueva contraseña"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="button">
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
