// src/pages/ConfirmEmail.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const email = query.get('email');

    const confirmEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/confirm-email?token=${token}&email=${email}`,
          {
            method: 'GET',
          }
        );

        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          Swal.fire('Éxito', result.message, 'success').then(() => navigate('/auth/login'));
        } else {
          setStatus('error');
          Swal.fire('Error', result.message || 'Error en la confirmación', 'error');
        }
      } catch (error) {
        setStatus('error');
        Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      }
    };

    confirmEmail();
  }, [location.search, navigate]);

  return (
    <div className="confirm-email-page">
      <div className="confirm-email-container">
        {status === null && <p>Confirmando tu correo electrónico...</p>}
        {status === 'success' && <p>Correo electrónico confirmado exitosamente.</p>}
        {status === 'error' && <p>Error en la confirmación de correo electrónico.</p>}
      </div>
    </div>
  );
};

export default ConfirmEmail;
