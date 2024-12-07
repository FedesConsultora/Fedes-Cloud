// src/components/UserInfo.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { FaSignOutAlt } from 'react-icons/fa';

const UserInfo = ({ onLogout }) => {
  const { user } = useContext(AuthContext);

  if (!user) return null; // Si no hay usuario logueado, no muestra nada.

  return (
    <div className="user-info">
        <div className="user-details">
            <img
                src={`${process.env.PUBLIC_URL}/assets/icons/user-placeholder2.png`}
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
    </div>
  );
};

export default UserInfo;
