// src/pages/Register.js

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerValidationSchema } from '../validations/authValidation.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import Logo from '../components/Logo.js';
import { formatDate } from '../utils/formatDate.js'; 

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError, // Para asignar errores específicos
  } = useForm({
    resolver: yupResolver(registerValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log('Raw Data:', data);
      
      const formattedFechaNacimiento = formatDate(data.fechaNacimiento);

      const clientURI = window.location.origin; 

      const response = await fetch(`${config.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          fechaNacimiento: formattedFechaNacimiento,
          clientURI, 
        }),
      });

      console.log('Response Status:', response.status);
      const result = await response.json();
      console.log('Response Body:', result);

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
      } else if (response.status === 400) {
        // Procesar errores de validación específicos
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map((err) => `${err.field}: ${err.message}`).join('\n');
          Swal.fire('Errores de Validación', errorMessages, 'error');

          // Asignar errores a campos específicos en react-hook-form
          result.errors.forEach((err) => {
            setError(err.field, {
              type: 'server',
              message: err.message,
            });
          });
        } else {
          // Error genérico
          Swal.fire('Error', result.message, 'error');
        }
      } else {
        Swal.fire('Error', result.message || 'Error en el registro', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error('Error:', error);
    }
  };

  // Estado para manejar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para la validación en tiempo real
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

  return (
    <div className="register-page">
      <div className="register-container">
        <Logo />
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              {...register('nombre')}
              placeholder="Ingresa tu nombre"
            />
            {errors.nombre && <span className="error">{errors.nombre.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input
              type="text"
              id="apellido"
              {...register('apellido')}
              placeholder="Ingresa tu apellido"
            />
            {errors.apellido && <span className="error">{errors.apellido.message}</span>}
          </div>

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
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword')}
                placeholder="Confirma tu contraseña"
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

          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input
              type="date"
              id="fechaNacimiento"
              {...register('fechaNacimiento')}
            />
            {errors.fechaNacimiento && <span className="error">{errors.fechaNacimiento.message}</span>}
          </div>

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <div className="social-login">
          <p>O regístrate con:</p>
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

export default Register;
