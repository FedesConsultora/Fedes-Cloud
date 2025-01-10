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
    rol: '',
    estado: '',
    // Otros campos según tu API
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/users/${userId}`, { // Correcta URL API
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUserData(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener los datos del usuario', 'error');
        navigate('/admin'); // Opcional: Redirigir si no se encuentran datos
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los datos del usuario', 'error');
      navigate('/admin'); // Opcional: Redirigir en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_URL}/users/${userId}`, { // Correcta URL API
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
        navigate(`/admin/users/${userId}`);
      } else {
        Swal.fire('Error', data.message || 'No se pudo actualizar el usuario', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al actualizar el usuario', 'error');
    }
  };

  if (loading) {
    return <div>Cargando...</div>; // Puedes reemplazar con un spinner
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="rol">Rol:</label>
            <select name="rol" id="rol" value={userData.rol} onChange={handleChange} required>
              <option value="">Seleccionar Rol</option>
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
              {/* Agrega más roles según tu aplicación */}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado:</label>
            <select name="estado" id="estado" value={userData.estado} onChange={handleChange} required>
              <option value="">Seleccionar Estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              {/* Agrega más estados según tu aplicación */}
            </select>
          </div>
          {/* Agrega más campos según tu API */}
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