// src/components/UserInfo.js
import React, { useContext } from 'react';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';

const UserInfo = ({ onLogout }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="user-info">
      <div className="user-details" onClick={() => navigate('/user/profile')}>
        <img
          // Si user.avatar está disponible, lo usa; sino, se muestra la imagen placeholder
          src={user.avatar || `${process.env.PUBLIC_URL}/assets/icons/user-placeholder2.png`}
          alt="User Avatar"
          className="user-avatar"
        />
        <div className="user-text">
          <p><strong>{user.nombre} {user.apellido}</strong></p>
          <p>ID: {user.id_usuario}</p>
        </div>
      </div>
      <button className="logout-button" onClick={onLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
      <button className="profile-button" onClick={() => navigate('/user/profile')}>
        <FaUser />
        <span>Perfil</span>
      </button>
    </div>
  );
};

export default UserInfo;
