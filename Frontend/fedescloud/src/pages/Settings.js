// src/pages/Settings.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import EnableTwoFactor from '../components/EnableTwoFactor.js';
import DisableTwoFactor from '../components/DisableTwoFactor.js';

const Settings = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Configuración de Cuenta</h2>
        
        <div className="settings-section">
          <h3>Autenticación de Dos Factores (2FA)</h3>
          <p>Protege tu cuenta añadiendo una capa adicional de seguridad. Escanea el código y proporciona el token 2FA para habilitar o deshabilitar la autenticación en dos pasos.</p>
          {user.twoFactorEnabled ? (
            <DisableTwoFactor />
          ) : (
            <EnableTwoFactor />
          )}
        </div>

        {/* Aquí en el futuro puedes agregar más secciones, ej:
        <div className="settings-section">
          <h3>Información de la Cuenta</h3>
          <p>Actualiza tu nombre, apellido o foto de perfil.</p>
          ... formulario ...
        </div>
        */}
      </div>
    </div>
  );
};

export default Settings;
