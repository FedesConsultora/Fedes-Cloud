// src/pages/Profile.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';

const Profile = () => {
  const { user } = useContext(AuthContext);

  // Dado que es una ruta protegida, `user` debería existir si se llegó a este punto.
  // Si por alguna razón user es null, puedes mostrar un mensaje o un "No user data".
  if (!user) {
    return <div>No se encontraron datos del usuario.</div>;
  }

  return (
    <div className="profile-page">
      <h2>Perfil del Usuario</h2>
      <div className="profile-info">
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Apellido:</strong> {user.apellido}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {/* Agrega más campos según sea necesario */}
      </div>
    </div>
  );
};

export default Profile;
