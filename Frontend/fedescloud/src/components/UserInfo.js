// src/components/UserInfo.js
import React, { useContext } from 'react';
import { FaSignOutAlt, FaUser, FaChevronRight } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';

const UserInfo = ({ onLogout }) => {
  const { user, accessAsParent, subRole  } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log(accessAsParent)
  if (!user) return null;

  // Si estamos accediendo como cuenta padre, obtenemos el perfil del hijo desde localStorage
  const childProfile = accessAsParent
    ? JSON.parse(localStorage.getItem('childProfile') || '{}')
    : null;

  return (
    <div className="user-info">
      {accessAsParent && childProfile && Object.keys(childProfile).length > 0 && (
        <div className="account-switch-info">
          <p className='tuCuenta'><strong >TU CUENTA: </strong> <span className='nameCuenta'>{childProfile.nombre} {childProfile.apellido}</span></p>
          <p><strong>ESTÁS EN LA CUENTA DE:</strong></p>
        </div>
      )}
      <div className="user-details" onClick={() => navigate('/user/profile')}>
        <img
          src={user.avatar || `${process.env.PUBLIC_URL}/assets/icons/user-placeholder2.png`}
          alt="User Avatar"
          className="user-avatar"
        />
        <div className="user-text">
          <p><strong>{user.nombre} {user.apellido}</strong></p>
          <p>ID: {user.id_usuario}</p>
        </div>
      </div>
      <div
        className="access-link"
        onClick={() => navigate('/cuentas')}
        style={{
          cursor: 'pointer',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid #ccc',
          marginBottom: '1rem',
        }}
      >
        <span>Ir a Cuentas</span>
        <FaChevronRight />
      </div>
      {/* Si se está accediendo como cuenta padre, mostramos la info extra */}
      
      {accessAsParent && childProfile && Object.keys(childProfile).length > 0 && (
        <div className="parent-role-info">
          <p><strong>TU ROL:</strong> <span>{subRole || 'No configurado'}</span></p>
        </div>
      )}
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
