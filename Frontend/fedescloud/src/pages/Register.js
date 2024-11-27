// src/pages/Register.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerValidationSchema } from '../validations/authValidation.js';
import Swal from 'sweetalert2';

const Register = ({ toggleAuth }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Realiza la solicitud al backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success');
        navigate('/auth/login');
      } else {
        Swal.fire('Error', result.message || 'Error en el registro', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" {...register('nombre')} placeholder="Ingresa tu nombre" />
            {errors.nombre && <span className="error">{errors.nombre.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input type="text" id="apellido" {...register('apellido')} placeholder="Ingresa tu apellido" />
            {errors.apellido && <span className="error">{errors.apellido.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" {...register('email')} placeholder="Ingresa tu correo" />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" {...register('password')} placeholder="Ingresa tu contraseña" />
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
            <input type="date" id="fechaNacimiento" {...register('fechaNacimiento')} />
            {errors.fechaNacimiento && <span className="error">{errors.fechaNacimiento.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="id_autenticacion">ID de Autenticación</label>
            <input
              type="number"
              id="id_autenticacion"
              {...register('id_autenticacion')}
              placeholder="Ingresa tu ID de autenticación"
            />
            {errors.id_autenticacion && <span className="error">{errors.id_autenticacion.message}</span>}
          </div>

          <button type="submit" className="button">
            Registrarse
          </button>
        </form>
        <div className="switch-auth">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <a href="#" onClick={toggleAuth}>
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
