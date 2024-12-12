// src/components/EnableTwoFactor.js
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';

const EnableTwoFactor = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Importamos la función updateUser del contexto, o simplemente fetchUserProfile si tienes acceso a ella.
  const { user, updateUser, login } = useContext(AuthContext);

  useEffect(() => {
    const enable2FA = async () => {
      try {
        const response = await fetch(`${config.API_URL}/auth/enable-2fa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const result = await response.json();

        if (response.ok) {
          setQrCode(result.data.qrCodeDataURL);
          setSecret(result.data.secret);
        } else {
          Swal.fire('Error', result.message || 'Error al generar 2FA', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
        console.error(error);
      }
    };

    enable2FA();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch(`${config.API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success');
        // Aquí actualizamos el estado del usuario para reflejar que twoFactorEnabled = true
        updateUser({ ...user, twoFactorEnabled: true });
        // Opcionalmente, podrías llamar login() si quieres refetch del perfil.
        // await login(); // Si tu login hace fetchUserProfile internamente.
      } else {
        Swal.fire('Error', result.message || 'Código 2FA inválido', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="enable-two-factor">
      <p>Para <strong>habilitar</strong> la autenticación de dos factores, escanea el siguiente código QR con tu aplicación de autenticación y luego ingresa el código generado.</p>
      {qrCode ? (
        <div>
          <img src={qrCode} alt="QR Code para 2FA" />
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="token">Código 2FA</label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ingresa el código de 6 dígitos"
              />
            </div>
            <button type="submit" className="button" disabled={isVerifying}>
              {isVerifying ? 'Verificando...' : 'Verificar y Habilitar 2FA'}
            </button>
          </form>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default EnableTwoFactor;
