// src/components/DisableTwoFactor.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const DisableTwoFactor = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [token, setToken] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setIsDisabling(true);

    try {
      const response = await fetch(`${config.API_URL}/auth/disable-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });

      const result = await response.json();
      
      if (response.ok) {
        Swal.fire('Éxito', result.message, 'success');
        // Aquí es donde actualizamos el estado del usuario:
        // Podemos hacer fetchUserProfile desde el AuthContext si existe,
        // o simplemente actualizar user.twoFactorEnabled = false:
        updateUser({ ...user, twoFactorEnabled: false });
      } else {
        Swal.fire('Error', result.message || 'No se pudo deshabilitar 2FA', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
      console.error(error);
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="disable-2fa">
      <p>Para <strong>deshabilitar</strong> la autenticación de dos factores, ingresa el código 2FA actual:</p>
      <form onSubmit={handleDisable2FA}>
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
        <button type="submit" className="button" disabled={isDisabling}>
          {isDisabling ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
        </button>
      </form>
    </div>
  );
};

export default DisableTwoFactor;
