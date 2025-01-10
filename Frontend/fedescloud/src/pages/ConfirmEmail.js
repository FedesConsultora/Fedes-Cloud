// src/pages/ConfirmEmail.js
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasConfirmedRef = useRef(false); 

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const email = query.get('email');

    const confirmEmail = async () => {
      if (hasConfirmedRef.current) return; // Evitar múltiples llamadas
      hasConfirmedRef.current = true;

      try {
        const response = await fetch(
          `${config.API_URL}/auth/confirm-email?token=${token}&email=${email}`,
          {
            method: 'GET',
          }
        );
        console.log('respuesta: ', response);
        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
        } else {
          setStatus('error');

          if (result.errors && result.errors.length > 0) {
            const errorMessages = result.errors.map((err) => `${err.field}: ${err.message}`).join('\n');
            Swal.fire('Error', errorMessages, 'error');

            // Verificar si el error es por token expirado
            const tokenExpiredError = result.errors.find(
              (err) => err.message.toLowerCase().includes('expirado')
            );

            if (tokenExpiredError) {
              setTokenExpired(true);
            }
          } else {
            Swal.fire('Error', result.message || 'Error en la confirmación', 'error');
          }
        }
      } catch (error) {
        setStatus('error');
        Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
        console.error(error);
      }
    };

    
  }, [location.search, navigate]);

  const handleResend = async () => {
    const query = new URLSearchParams(location.search);
    const email = query.get('email');
    const clientURI = window.location.origin; // Obtener el clientURI dinámicamente

    if (!email) {
      Swal.fire('Error', 'Email no proporcionado. Por favor, intenta nuevamente.', 'error');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${config.API_URL}/auth/resend-confirm-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, clientURI }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
      } else {
        Swal.fire('Error', result.message || 'Error al reenviar confirmación', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="confirm-email-page">
      <div className="confirm-email-container">
        {status === null && <p>Confirmando tu correo electrónico...</p>}
        {status === 'success' && <p>Correo electrónico confirmado exitosamente.</p>}
        {status === 'error' && !tokenExpired && <p>Error en la confirmación de correo electrónico.</p>}
        {status === 'error' && tokenExpired && (
          <div>
            <p>El token de confirmación ha expirado.</p>
            <button onClick={handleResend} disabled={isResending} className="resend-button">
              {isResending ? 'Reenviando...' : 'Reenviar Correo de Confirmación'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
