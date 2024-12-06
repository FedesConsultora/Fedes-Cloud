// src/pages/Login.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidationSchema } from '../validations/authValidation.js';
import Logo from '../components/Logo.js';
import Swal from 'sweetalert2';
import config from '../config/config.js'; 

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError, 
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log('Login Data:', data);

      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      console.log('Response:', response);
      const result = await response.json();
      console.log('Response Body:', result);
      
      if (response.ok) {
        await login(); 
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/'));
      } else if (response.status === 400 || response.status === 401) {
        // Procesar errores de validación específicos o errores de autenticación
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map((err) => `Error: ${err.message}`).join('\n');
          Swal.fire('Errores', errorMessages, 'error');

          // Asignar errores a campos específicos en react-hook-form
          result.errors.forEach((err) => {
            setError(err.field, {
              type: 'server',
              message: err.message,
            });
          });
        } else {
          // Error genérico
          Swal.fire('Error', result.message || 'Error en el inicio de sesión', 'error');
        }
      } else {
        Swal.fire('Error', result.message || 'Error en el inicio de sesión', 'error');
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

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              {...register('password')}
              placeholder="Ingresa tu contraseña"
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>
        <div className="additional-links">
          <Link to="/auth/request-password-reset" className="link">
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="switch-auth">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/auth/register">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;