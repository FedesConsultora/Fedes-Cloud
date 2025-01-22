// src/pages/UserDetail.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const UserDetail = () => {
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`${config.API_URL}/users/${userId}`, { 
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUserDetail(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener los detalles del usuario', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los detalles del usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/users/${userId}/edit`); // Asegúrate de que esta ruta exista en App.js
  };

  if (loading) {
    return <div>Cargando...</div>; // Puedes reemplazar con un spinner
  }

  if (!userDetail) {
    return <div>No se encontraron detalles para este usuario.</div>;
  }

  return (
    <div className="user-detail-page">
      <h2>Detalles del Usuario</h2>
      <div className="detail-container">
        <p><strong>Nombre:</strong> {`${userDetail.nombre} ${userDetail.apellido}`}</p>
        <p><strong>Email:</strong> {userDetail.email}</p>
        <p><strong>Rol:</strong> {userDetail.Rol.nombre}</p>
        <p><strong>Estado:</strong> {userDetail.Estado.nombre}</p>
        <p><strong>Fecha de Creación:</strong> {new Date(userDetail.createdAt).toLocaleDateString()}</p>
        {/* Agrega más detalles según tu API */}
        <h3>Servicios Asociados</h3>
        {userDetail.servicios && userDetail.servicios.length > 0 ? (
          <ul>
            {userDetail.servicios.map((servicio) => (
              <li key={servicio.id_servicio}>{servicio.nombreServicio}</li>
            ))}
          </ul>
        ) : (
          <p>No tiene servicios asociados.</p>
        )}
        <button onClick={handleEdit} className="button edit-button">Editar Usuario</button>
      </div>
    </div>
  );
};

export default UserDetail;
