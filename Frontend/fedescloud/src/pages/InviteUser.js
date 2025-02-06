// src/pages/InviteUser.js
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const InviteUser = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    subRol: 'No configurado',
    permitirSoporte: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInviteData({
      ...inviteData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Verificar si el email existe en el sistema
  const checkEmailExists = async () => {
    if (!inviteData.email) return;
    try {
      // Este endpoint debe estar implementado en el backend para responder { exists: true/false }
      const response = await fetch(`${config.API_URL}/user-composite/check-email?email=${encodeURIComponent(inviteData.email)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setEmailExists(result.exists);
      } else {
        setEmailExists(false);
      }
    } catch (error) {
      console.error('Error al verificar el email:', error);
      setEmailExists(false);
    } finally {
      setEmailChecked(true);
    }
  };

  const handleEmailBlur = () => {
    checkEmailExists();
  };

  const handleNext = () => {
    if (!inviteData.email) {
      Swal.fire('Advertencia', 'Debes ingresar un email.', 'warning');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleInvite = async () => {
    try {
      const response = await fetch(`${config.API_URL}/user-composite/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteData.email,
          subRol: inviteData.subRol,
          permitirSoporte: inviteData.permitirSoporte,
          clientURI: config.CLIENT_URI, 
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Swal.fire('Éxito', 'Invitación enviada correctamente', 'success');
        onClose && onClose();
      } else {
        Swal.fire('Error', result.message || 'No se pudo enviar la invitación', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al enviar la invitación', 'error');
    }
  };

  return (
    <div className="invite-user">
      {step === 1 && (
        <div className="invite-step step-1">
          <h3>Paso 1 de 2: Información del Usuario</h3>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={inviteData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              placeholder="Ingresa el email del integrante"
            />
            {emailChecked && !emailExists && inviteData.email && (
              <small className="info-text">
                El email que ingresaste no está registrado. Al enviar la invitación, se creará automáticamente una cuenta asociada a Donweb.
              </small>
            )}
          </div>
          <div className="form-group">
            <label>Rol en la cuenta</label>
            <select name="subRol" value={inviteData.subRol} onChange={handleChange}>
              <option value="No configurado">No configurado</option>
              <option value="Administrador">Administrador</option>
              <option value="Facturación">Facturación</option>
              <option value="Registrante">Registrante</option>
              <option value="Técnico">Técnico</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="permitirSoporte"
                checked={inviteData.permitirSoporte}
                onChange={handleChange}
              />
              Permitir tickets en Soporte
            </label>
          </div>
          <button type="button" className="button" onClick={handleNext}>
            Siguiente
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="invite-step step-2">
          <h3>Paso 2 de 2: Verificación y Envío de Invitación</h3>
          <div className="summary">
            <p><strong>Email:</strong> {inviteData.email}</p>
            <p><strong>Rol asignado:</strong> {inviteData.subRol}</p>
            <p><strong>Acceso a Soporte:</strong> {inviteData.permitirSoporte ? 'Activado' : 'Desactivado'}</p>
          </div>
          <p>
            Comprueba que la información sea correcta. Una vez enviado el email a la dirección que proporcionaste, la invitación quedará como estado pendiente hasta que sea aceptada o expire.
          </p>
          <p>
            Recuerda que si el email no está registrado, se creará automáticamente una cuenta asociada a Donweb.
          </p>
          <div className="summary-details">
            <p><strong>Información del integrante de la cuenta:</strong></p>
            <p><strong>Email:</strong> {inviteData.email}</p>
            <p><strong>Rol asignado:</strong> {inviteData.subRol}</p>
            <p><strong>Acceso a Soporte:</strong> {inviteData.permitirSoporte ? 'Activado' : 'Desactivado'}</p>
          </div>
          <div className="buttons-group">
            <button type="button" className="button" onClick={handleBack}>
              Volver
            </button>
            <button type="button" className="button" onClick={handleInvite}>
              Enviar Invitación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteUser;
