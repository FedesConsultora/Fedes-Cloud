import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import EnableTwoFactor from '../components/EnableTwoFactor.js';
import DisableTwoFactor from '../components/DisableTwoFactor.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('2FA');
  const [emailData, setEmailData] = useState({newEmail:'', confirmEmailToken:''});
  const [passwordData, setPasswordData] = useState({currentPassword:'', newPassword:''});

  const handleEmailChange = (e) => {
    setEmailData({...emailData, [e.target.name]: e.target.value});
  };

  const handlePasswordChange = (e) => {
    setPasswordData({...passwordData, [e.target.name]: e.target.value});
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_URL}/auth/update-credentials`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          confirmEmailToken: emailData.confirmEmailToken,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire('Éxito', 'Credenciales actualizadas exitosamente', 'success');
      } else {
        Swal.fire('Error', result.message || 'No se pudo actualizar las credenciales', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  const render2FAContent = () => (
    <div className="settings-section">
      <h3>Autenticación de Dos Factores (2FA)</h3>
      <p>Añade una capa adicional de seguridad a tu cuenta. Escanea el código QR y usa la app de autenticación.</p>
      {user.twoFactorEnabled ? (
        <DisableTwoFactor />
      ) : (
        <EnableTwoFactor />
      )}
    </div>
  );

  const renderAccountContent = () => (
    <div className="settings-section">
      <h3>Configuración de Cuenta</h3>
      <p>Cambia tu correo electrónico y/o contraseña. Se puede requerir un token enviado a tu nuevo correo o tu contraseña actual.</p>
      <form onSubmit={handleUpdateCredentials}>
        <div className="form-group">
          <label htmlFor="newEmail">Nuevo correo electrónico</label>
          <input type="email" id="newEmail" name="newEmail" value={emailData.newEmail} onChange={handleEmailChange} placeholder="Ingresa tu nuevo correo" />
        </div>
        <div className="form-group">
          <label htmlFor="confirmEmailToken">Token de confirmación de correo (opcional)</label>
          <input type="text" id="confirmEmailToken" name="confirmEmailToken" value={emailData.confirmEmailToken} onChange={handleEmailChange} placeholder="Token enviado al nuevo correo" />
        </div>
        <div className="form-group">
          <label htmlFor="currentPassword">Contraseña actual</label>
          <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Tu contraseña actual" />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Nueva contraseña</label>
          <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Tu nueva contraseña" />
        </div>
        <button type="submit" className="button">Actualizar</button>
      </form>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Configuración de Cuenta</h2>
        <div className="settings-tabs">
          <button className={activeTab === '2FA' ? 'active' : ''} onClick={() => setActiveTab('2FA')}>
            Autenticación 2FA
          </button>
          <button className={activeTab === 'Account' ? 'active' : ''} onClick={() => setActiveTab('Account')}>
            Cambiar Email/Contraseña
          </button>
        </div>
        {activeTab === '2FA' ? render2FAContent() : renderAccountContent()}
      </div>
    </div>
  );
};

export default Settings;
