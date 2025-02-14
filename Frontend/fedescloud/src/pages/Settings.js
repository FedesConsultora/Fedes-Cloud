// src/pages/Settings.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import EnableTwoFactor from '../components/EnableTwoFactor.js';
import DisableTwoFactor from '../components/DisableTwoFactor.js';
import CredentialsSettings from '../components/CredentialsSettings.js';

const Settings = () => {
  const { user, accessAsParent } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('2FA');

  if (!user) {
    return <div>No se encontraron datos del usuario.</div>;
  }

  const render2FAContent = () => {
    if (accessAsParent) {
      return (
        <div className="settings-section">
          <h3>Autenticación de Dos Factores (2FA)</h3>
          <p>Solo el dueño de la cuenta puede modificar la autenticación 2FA.</p>
        </div>
      );
    }
    return (
      <div className="settings-section">
        <h3>Autenticación de Dos Factores (2FA)</h3>
        <p>
          Añade una capa adicional de seguridad a tu cuenta. Escanea el código QR y usa la app de autenticación.
        </p>
        {user.twoFactorEnabled ? <DisableTwoFactor /> : <EnableTwoFactor />}
      </div>
    );
  };

  const renderCredentialsContent = () => {
    return <CredentialsSettings />;
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Configuración de Cuenta</h2>
        <div className="settings-tabs">
          <button
            className={activeTab === '2FA' ? 'active' : ''}
            onClick={() => setActiveTab('2FA')}
          >
            Autenticación 2FA
          </button>
          <button
            className={activeTab === 'Credentials' ? 'active' : ''}
            onClick={() => setActiveTab('Credentials')}
          >
            Cambiar Email/Contraseña
          </button>
        </div>
        {activeTab === '2FA' ? render2FAContent() : renderCredentialsContent()}
      </div>
    </div>
  );
};

export default Settings;
