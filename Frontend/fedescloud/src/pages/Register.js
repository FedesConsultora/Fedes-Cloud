// src/pages/Register.js
import React from 'react';
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
    formState: { errors, isSubmitting },
    setError, // Para asignar errores específicos
  } = useForm({
    resolver: yupResolver(registerValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log('Raw Data:', data);
      
      // Formatear la fecha de nacimiento a DD/MM/YYYY
      const formattedFechaNacimiento = formatDate(data.fechaNacimiento);
      console.log('Formatted Fecha Nacimiento:', formattedFechaNacimiento);

      // Obtener el client URI dinámicamente
      const clientURI = window.location.origin; // Por ejemplo, 'http://localhost:3000' o 'https://tudominio.com'

      // Realiza la solicitud al backend
      const response = await fetch(`${config.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: data.password,
          fechaNacimiento: formattedFechaNacimiento,
          id_autenticacion: data.id_autenticacion, 
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="Confirma tu contraseña"
            />
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

          <div className="form-group">
            <label htmlFor="id_autenticacion">ID de Autenticación</label>
            <input
              type="number"
              id="id_autenticacion"
              {...register('id_autenticacion', { valueAsNumber: true })}
              placeholder="Ingresa tu ID de autenticación"
            />
            {errors.id_autenticacion && <span className="error">{errors.id_autenticacion.message}</span>}
          </div>

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
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

export default Register;