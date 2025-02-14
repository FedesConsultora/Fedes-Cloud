// src/pages/InviteUser.js
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const InviteUser = ({ onClose, mode = 'invite', initialData = {} }) => {
  // Paso del formulario: 1 = datos del usuario; 2 = verificación y confirmación
  const [step, setStep] = useState(1);
  // Estado para saber si ya se verificó el email (solo en modo "invite")
  const [emailChecked, setEmailChecked] = useState(false);
  // Estado que indica si el email existe en el sistema
  const [emailExists, setEmailExists] = useState(false);
  // Estado del formulario, inicializado con los datos de initialData (si existen) o valores por defecto
  const [inviteData, setInviteData] = useState({
    email: initialData?.email || '',
    subRol: initialData?.subRol || 'No configurado',
    permitirSoporte: initialData?.permitirSoporte || false,
  });

  // Maneja el cambio en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInviteData({
      ...inviteData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const checkEmailExists = async () => {
    if (!inviteData.email) return;
    try {
      const response = await fetch(
        `${config.API_URL}/user-composite/check-email?email=${encodeURIComponent(inviteData.email)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
          },
        }
      );
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

  // Se ejecuta al salir del input de email (solo en modo "invite")
  const handleEmailBlur = () => {
    if (mode !== 'edit') {
      checkEmailExists();
    }
  };

  // Avanza al siguiente paso si se ha ingresado un email
  const handleNext = () => {
    if (!inviteData.email) {
      Swal.fire('Advertencia', 'Debes ingresar un email.', 'warning');
      return;
    }
    setStep(2);
  };

  // Retrocede al paso anterior
  const handleBack = () => {
    setStep(1);
  };

  // Función para enviar la invitación o guardar los cambios (según el modo)
  const handleSubmit = async () => {
    try {
      const endpoint =
        mode === 'invite'
          ? `${config.API_URL}/user-composite/invite`
          : `${config.API_URL}/user-composite/edit/${initialData.id_usuario}`;
      const method = mode === 'invite' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
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
        Swal.fire(
          'Éxito',
          mode === 'invite' ? 'Invitación enviada correctamente' : 'Cambios guardados correctamente',
          'success'
        );
        if (onClose) onClose();
      } else {
        Swal.fire('Error', result.message || 'No se pudo procesar la solicitud', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al enviar la solicitud', 'error');
    }
  };

  return (
    <div className="invite-user">
      <h3>{mode === 'edit' ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
      {step === 1 && (
        <div className="invite-step step-1">
          <h4>Paso 1 de 2: Información del Usuario</h4>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={inviteData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              placeholder="Ingresa el email del integrante"
              disabled={mode === 'edit'} // En modo edición, el email no se puede modificar
            />
            {mode !== 'edit' && emailChecked && !emailExists && inviteData.email && (
              <small className="info-text">
                El email que ingresaste no está registrado. Al enviar la invitación, se creará automáticamente una cuenta asociada a Fedes Cloud.
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
          <h4>Paso 2 de 2: Verificación y Confirmación</h4>
          <div className="summary">
            <p><strong>Email:</strong> {inviteData.email}</p>
            <p><strong>Rol asignado:</strong> {inviteData.subRol}</p>
            <p>
              <strong>Acceso a Soporte:</strong>{' '}
              {inviteData.permitirSoporte ? <span className="support-access">Activado</span> : 'Desactivado'}
            </p>
          </div>
          <div className="buttons-group">
            <button type="button" className="button" onClick={handleBack}>
              Volver
            </button>
            <button type="button" className="button" onClick={handleSubmit}>
              {mode === 'edit' ? 'Guardar cambios' : 'Enviar Invitación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteUser;
