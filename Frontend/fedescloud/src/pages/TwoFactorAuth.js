import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const twoFactorSchema = yup.object().shape({
  twoFactorToken: yup
    .string()
    .required('El código de autenticación es obligatorio')
    .matches(/^\d{6}$/, 'El código debe tener 6 dígitos'),
});

const TwoFactorAuth = () => {
  const { completeTwoFactorAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(twoFactorSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await completeTwoFactorAuth(data.twoFactorToken);
      Swal.fire('Éxito', 'Inicio de sesión exitoso con 2FA.', 'success').then(() => navigate('/'));
    } catch (error) {
      Swal.fire('Error', error.message || 'Código de 2FA inválido', 'error');
      setError('twoFactorToken', {
        type: 'manual',
        message: error.message || 'Código de 2FA inválido',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="two-factor-auth">
      <h3>Autenticación de Dos Factores</h3>
      <p>Ingresa el código generado por tu aplicación de autenticación.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="twoFactorToken">Código 2FA</label>
          <input
            type="text"
            id="twoFactorToken"
            {...register('twoFactorToken')}
            placeholder="Ingresa tu código de 6 dígitos"
          />
          {errors.twoFactorToken && <span className="error">{errors.twoFactorToken.message}</span>}
        </div>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Verificando...' : 'Verificar'}
        </button>
      </form>
    </div>
  );
};

export default TwoFactorAuth;
