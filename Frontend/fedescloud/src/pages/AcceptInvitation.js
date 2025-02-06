// src/pages/AcceptInvitation.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { acceptInvitationSchema } from '../validations/acceptInvitationValidation.js';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Estado para almacenar la data de la invitación (por ejemplo, si es cuenta nueva)
  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // React Hook Form con yupResolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(acceptInvitationSchema),
  });

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Obtener los detalles de la invitación
  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(
          `${config.API_URL}/user-composite/invite/accept?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const result = await response.json();
        if (response.ok && result.success) {
          setInvitationData(result.data);
        } else {
          Swal.fire('Error', result.message || 'Invitación no válida o expirada', 'error');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error fetching invitation details:', error);
        Swal.fire('Error', 'Ocurrió un error al verificar la invitación', 'error');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchInvitationDetails();
  }, [token, email, navigate]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        token,
        email,
        ...data,
      };
      const response = await fetch(`${config.API_URL}/user-composite/invite/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        Swal.fire('Éxito', result.message, 'success');
        navigate('/auth'); // Redirigir al login o dashboard
      } else {
        Swal.fire('Error', result.message || 'No se pudo aceptar la invitación', 'error');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Swal.fire('Error', 'Ocurrió un error al aceptar la invitación', 'error');
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Si la invitación corresponde a una cuenta existente, sugerir iniciar sesión.
  if (invitationData && !invitationData.isNewAccount) {
    return (
      <div className="accept-invitation">
        <h2>Invitación Confirmada</h2>
        <p>
          Tu invitación ha sido confirmada. Por favor, inicia sesión para vincular tu cuenta.
        </p>
        <button className="button" onClick={() => navigate('/auth')}>
          Ir al Login
        </button>
      </div>
    );
  }

  // Si es para una cuenta nueva, mostrar el formulario para actualizar datos.
  return (
    <div className="accept-invitation">
      <h2>Acepta tu Invitación</h2>
      <p>
        Para completar tu registro en Fedes Cloud, por favor actualiza tus datos.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Nuevo Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu nueva contraseña"
              {...register('newPassword')}
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
          {errors.newPassword && <span className="error">{errors.newPassword.message}</span>}
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirma tu nueva contraseña"
              {...register('confirmPassword')}
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
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            {...register('nombre')}
          />
          {errors.nombre && <span className="error">{errors.nombre.message}</span>}
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            placeholder="Ingresa tu apellido"
            {...register('apellido')}
          />
          {errors.apellido && <span className="error">{errors.apellido.message}</span>}
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            {...register('fechaNacimiento')}
          />
          {errors.fechaNacimiento && <span className="error">{errors.fechaNacimiento.message}</span>}
        </div>

        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : 'Aceptar Invitación'}
        </button>
      </form>
    </div>
  );
};

export default AcceptInvitation;