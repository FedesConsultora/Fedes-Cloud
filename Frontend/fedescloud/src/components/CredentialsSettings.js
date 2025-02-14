// src/components/CredentialsSettings.js
import React, { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';

const CredentialsSettings = () => {
  const { accessAsParent } = useContext(AuthContext);

  // Estado para el formulario de actualización de correo
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPasswordForEmail: ''
  });

  // Estado para el formulario de actualización de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // Estados para mostrar/ocultar las contraseñas (para ambos formularios)
  const [showCurrentPasswordEmail, setShowCurrentPasswordEmail] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Maneja cambios en el formulario de correo
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para actualizar el correo electrónico  
  // (el email real no se cambia hasta que el usuario confirme el cambio mediante el enlace enviado)
  const updateEmail = async (e) => {
    e.preventDefault();
    if (accessAsParent) {
      Swal.fire('Atención', 'Solo el dueño de la cuenta puede actualizar el correo electrónico.', 'info');
      return;
    }
    try {
      const clientURI = window.location.origin; // Se obtiene dinámicamente la URL del front
      const response = await fetch(`${config.API_URL}/auth/update-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          currentPassword: emailData.currentPasswordForEmail,
          clientURI: clientURI
        })
      });
      const result = await response.json();
      if (response.ok) {
        // No se cambia el email real hasta que se confirme el cambio; se envía un correo al nuevo email.
        Swal.fire('Éxito', 'Éxito, se envió un correo electrónico para confirmar el cambio.', 'success');
      } else {
        Swal.fire('Error', result.message || 'No se pudo actualizar el correo.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor.', 'error');
    }
  };

  // Función para actualizar la contraseña  
  // (más adelante se implementará la lógica de recuperación, pero aquí ya se prepara el envío del clientURI)
  const updatePassword = async (e) => {
    e.preventDefault();
    if (accessAsParent) {
      Swal.fire('Atención', 'Solo el dueño de la cuenta puede actualizar la contraseña.', 'info');
      return;
    }
    try {
      const clientURI = window.location.origin;
      const response = await fetch(`${config.API_URL}/auth/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...passwordData,
          clientURI: clientURI
        })
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire('Éxito', 'Contraseña actualizada exitosamente.', 'success');
      } else {
        Swal.fire('Error', result.message || 'No se pudo actualizar la contraseña.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor.', 'error');
    }
  };

  return (
    <div className="settings-section credentials-settings">
      <h3>Configuración de Cuenta</h3>
      {accessAsParent && (
        <div className="alert-message">
          Solo el dueño de la cuenta puede editar el correo electrónico y la contraseña.
        </div>
      )}

      {/* Formulario para actualizar el correo electrónico */}
      <form onSubmit={updateEmail} className="email-form">
        <h4>Cambiar Correo Electrónico</h4>
        <div className="form-group">
          <label htmlFor="newEmail">Nuevo correo electrónico</label>
          <input
            type="email"
            id="newEmail"
            name="newEmail"
            value={emailData.newEmail}
            onChange={handleEmailChange}
            placeholder="Ingresa tu nuevo correo"
            disabled={accessAsParent}
          />
        </div>
        <div className="form-group">
          <label htmlFor="currentPasswordForEmail">
            Contraseña actual (para cambiar correo)
          </label>
          <div className="password-wrapper">
            <input
              type={showCurrentPasswordEmail ? 'text' : 'password'}
              id="currentPasswordForEmail"
              name="currentPasswordForEmail"
              value={emailData.currentPasswordForEmail}
              onChange={handleEmailChange}
              placeholder="Tu contraseña actual"
              disabled={accessAsParent}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowCurrentPasswordEmail(!showCurrentPasswordEmail)}
              disabled={accessAsParent}
            >
              <img
                src={
                  showCurrentPasswordEmail
                    ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                    : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                }
                alt={showCurrentPasswordEmail ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                width="24"
                height="24"
              />
            </button>
          </div>
        </div>
        <button type="submit" className="button" disabled={accessAsParent}>
          Actualizar Correo
        </button>
      </form>

      <hr />

      {/* Formulario para actualizar la contraseña */}
      <form onSubmit={updatePassword} className="password-form">
        <h4>Cambiar Contraseña</h4>
        <div className="form-group">
          <label htmlFor="currentPassword">Contraseña actual</label>
          <div className="password-wrapper">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Tu contraseña actual"
              disabled={accessAsParent}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={accessAsParent}
            >
              <img
                src={
                  showCurrentPassword
                    ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                    : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                }
                alt={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                width="24"
                height="24"
              />
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Nueva contraseña</label>
          <div className="password-wrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Tu nueva contraseña"
              disabled={accessAsParent}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={accessAsParent}
            >
              <img
                src={
                  showNewPassword
                    ? `${process.env.PUBLIC_URL}/assets/icons/ojo-abierto.png`
                    : `${process.env.PUBLIC_URL}/assets/icons/ojo-cerrado.png`
                }
                alt={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                width="24"
                height="24"
              />
            </button>
          </div>
        </div>
        <button type="submit" className="button" disabled={accessAsParent}>
          Actualizar Contraseña
        </button>
      </form>
    </div>
  );
};

export default CredentialsSettings;