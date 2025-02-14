// src/pages/ConfirmEmail.js
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasConfirmedRef = useRef(false);
  
  if (window.location.search.includes('confirm-email')) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  }
  useEffect(() => {
    // Forzamos una recarga completa para salir del estado logueado
    // (esto ayuda a que no se cargue la ruta protegida si hay un token activo)
    

    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const email = query.get('email');

    const confirmEmail = async () => {
      if (hasConfirmedRef.current) return;
      hasConfirmedRef.current = true;

      try {
        const response = await fetch(
          `${config.API_URL}/auth/confirm-email?token=${token}&email=${email}`,
          { method: 'GET', credentials: 'include' }
        );
        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          Swal.fire('Éxito', result.message, 'success').then(async () => {
            // Forzamos el logout llamando al endpoint y limpiando el localStorage
            await fetch(`${config.API_URL}/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            localStorage.removeItem('token');
            // Redirigimos a la página de login
            navigate('/auth/login', { replace: true });
          });
        } else {
          setStatus('error');
          if (result.errors && result.errors.length > 0) {
            const errorMessages = result.errors.map((err) => `${err.field}: ${err.message}`).join('\n');
            Swal.fire('Error', errorMessages, 'error');
            const tokenExpiredError = result.errors.find((err) =>
              err.message.toLowerCase().includes('expirado')
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

    // Forzar que la confirmación se procese en una recarga completa
    // (esto puede hacerse abriendo el enlace en una nueva ventana o forzando window.location.href)
    confirmEmail();
  }, [location.search, navigate, logout]);

  const handleResend = async () => {
    const query = new URLSearchParams(location.search);
    const email = query.get('email');
    const clientURI = window.location.origin;
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
        Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login', { replace: true }));
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
