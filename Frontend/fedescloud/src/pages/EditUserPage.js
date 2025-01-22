// src/pages/EditUserPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const EditUserPage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    id_rol: '',
    id_estado: '',
    fechaNacimiento: '', 
    preferenciasNotificaciones: true, 
    id_autenticacion: '', 
    password: '', 
    originalEmail: '', 
  });
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchUserData(), fetchRoles(), fetchEstados()]);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/users/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUserData({
          ...data.data,
          password: '', // Asegura que 'password' siempre sea una cadena vacía
          originalEmail: data.data.email, // Almacena el email original
          id_autenticacion: data.data.id_autenticacion, // Incluye 'id_autenticacion'
        });
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener los datos del usuario', 'error');
        navigate('/admin'); // Opcional: Redirigir si no se encuentran datos
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los datos del usuario', 'error');
      navigate('/admin'); // Opcional: Redirigir en caso de error
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${config.API_URL}/users/roles`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setRoles(data.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener los roles', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los roles', 'error');
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await fetch(`${config.API_URL}/users/estados`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setEstados(data.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener los estados', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los estados', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios en el frontend (opcional)
    if (!userData.nombre.trim() || !userData.apellido.trim() || !userData.email.trim()) {
      Swal.fire('Error', 'Los campos nombre, apellido y email son obligatorios.', 'error');
      return;
    }

    // Identificar si el email está siendo cambiado
    const isEmailChanged = userData.email !== userData.originalEmail;

    // Preparar el payload
    const payload = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      id_rol: parseInt(userData.id_rol, 10),
      id_estado: parseInt(userData.id_estado, 10),
      fechaNacimiento: userData.fechaNacimiento, // Asegúrate de que está en el formato correcto
      preferenciasNotificaciones: userData.preferenciasNotificaciones,
      id_autenticacion: userData.id_autenticacion, // Incluir 'id_autenticacion' para evitar problemas de validación
      clientURI: window.location.origin,
    };

    // Incluir 'password' solo si no está vacío
    if (userData.password.trim() !== '') {
      payload.password = userData.password;
    }

    try {
      console.log('Payload:', payload);
      const response = await fetch(`${config.API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Response Data:', data); // Añade esta línea para ver la respuesta completa

      if (response.ok) {
        if (isEmailChanged) {
          Swal.fire(
            'Éxito',
            'El email ha sido actualizado. Se ha enviado un correo de confirmación al nuevo email del usuario.',
            'success'
          );
        } else {
          Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
        }
        navigate(`/admin/users/${userId}`);
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map((err) => `Error en ${err.param}: ${err.msg}`).join('<br/>');
          Swal.fire({
            title: 'Errores',
            html: errorMessages,
            icon: 'error',
          });
        } else {
          Swal.fire('Error', data.message || 'No se pudo actualizar el usuario', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al actualizar el usuario', 'error');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Cargando...</div>; // Reemplaza con un spinner si lo deseas
  }

  return (
    <div className="edit-user-page">
      <div className="edit-user-container">
        <h2>Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={userData.nombre}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="apellido">Apellido:</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={userData.apellido}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="id_rol">Rol:</label>
            <select name="id_rol" id="id_rol" value={userData.id_rol} onChange={handleChange} required>
              <option value="">Seleccionar Rol</option>
              {roles.map((rol) => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="id_estado">Estado:</label>
            <select name="id_estado" id="id_estado" value={userData.id_estado} onChange={handleChange} required>
              <option value="">Seleccionar Estado</option>
              {estados.map((estado) => (
                <option key={estado.id_estado} value={estado.id_estado}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={userData.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="preferenciasNotificaciones">Preferencias de Notificaciones:</label>
            <input
              type="checkbox"
              id="preferenciasNotificaciones"
              name="preferenciasNotificaciones"
              checked={userData.preferenciasNotificaciones}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña (Opcional):</label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Ingresa una nueva contraseña si deseas cambiarla"
              autoComplete="new-password"
            />
          </div>
          <div className="button-group">
            <button type="button" className="button cancel-button" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="button save-button">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
