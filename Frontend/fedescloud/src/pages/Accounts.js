// src/pages/Accounts.js
import React, { useEffect, useState, useContext } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import config from '../config/config.js';

const Accounts = () => {
  const { user, accessAsParent } = useContext(AuthContext);
  const navigate = useNavigate();
  const [parentAccounts, setParentAccounts] = useState([]);

  // Utilizamos el perfil del hijo original almacenado en localStorage (si existe)
  const effectiveChild = localStorage.getItem('childProfile')
    ? JSON.parse(localStorage.getItem('childProfile'))
    : user;

  const fetchParentAccounts = async () => {
    try {
      // Suponemos que el endpoint acepta un query para buscar según el id del hijo
      const response = await fetch(
        `${config.API_URL}/user-composite/parents?childId=${effectiveChild.id_usuario}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        setParentAccounts(result.data);
      } else {
        Swal.fire('Error', result.message || 'Error al obtener cuentas', 'error');
      }
    } catch (error) {
      console.error('Error fetching parent accounts:', error);
    }
  };
  
  useEffect(() => {
    if (effectiveChild) {
      fetchParentAccounts();
    }
  }, [effectiveChild]);

  // Función para acceder a la cuenta padre
  const handleAccess = async (parentId) => {
    // Guardamos el perfil y el token del hijo (solo si aún no se guardó)
    if (!localStorage.getItem('childProfile')) {
      localStorage.setItem('childProfile', JSON.stringify(user));
    }
    if (!localStorage.getItem('childToken')) {
      localStorage.setItem('childToken', localStorage.getItem('token'));
    }
    localStorage.setItem('accessAsParent', 'true');

    try {
      const response = await fetch(`${config.API_URL}/cuentas/${parentId}/acceder`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const result = await response.json();
      console.log('Resultado del acceso:', result);
      if (response.ok && result.success) {
        localStorage.setItem('token', result.token);
        window.location.reload();
      } else {
        Swal.fire('Error', result.message || 'No se pudo acceder a la cuenta', 'error');
      }
    } catch (error) {
      console.error('Error accessing parent account:', error);
    }
  };

  // Función para volver a la cuenta del hijo
  const revertToChildAccount = async () => {
    try {
      const response = await fetch(`${config.API_URL}/cuentas/switch-back`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Actualizamos localStorage con el token del hijo recibido
        localStorage.setItem('token', result.token);
        // Eliminamos las variables auxiliares
        localStorage.removeItem('accessAsParent');
        localStorage.removeItem('childProfile');
        window.location.reload();
      } else {
        Swal.fire('Error', result.message || 'No se pudo volver a la cuenta original', 'error');
      }
    } catch (error) {
      console.error('Error switching back to child account:', error);
    }
  };

  return (
    <div className="accounts-page">
      <h2>Tus Accesos</h2>
      <div className="cards-container">
        {/* Tarjeta para la cuenta del hijo */}
        <div className="access-card">
          <div className="card-header">
            <h3>
              {effectiveChild.nombre} {effectiveChild.apellido} (Tu cuenta)
            </h3>
            <p>{effectiveChild.email}</p>
          </div>
          <div className="card-body">
            <p><strong>Gestionar usuarios</strong></p>
            <p><strong>Tu rol:</strong> {effectiveChild.rol?.nombre || 'Completo'}</p>
            <p><strong>Soporte:</strong> Activo</p>
          </div>
          <div className="card-footer">
            {accessAsParent ? (
              <button className="button" onClick={revertToChildAccount}>
                Volver a mi cuenta
              </button>
            ) : (
              <button className="button" onClick={() => navigate('/')}>
                Ingresar
              </button>
            )}
          </div>
        </div>
        {/* Tarjetas para cada cuenta padre vinculada */}
        {parentAccounts.map((parent) => {
          const relation = parent.UsuarioPadreHijo || {};
          return (
            <div key={parent.id_usuario} className="access-card">
              <div className="card-header">
                <h3>
                  {parent.nombre} {parent.apellido}
                </h3>
                <p>{parent.email}</p>
              </div>
              <div className="card-body">
                <p><strong>Tu rol:</strong> {relation.subRol || 'No configurado'}</p>
                <p><strong>Soporte:</strong> {relation.permitirSoporte ? 'Activado' : 'Desactivado'}</p>
                <p><strong>Invitación:</strong> {relation.estado_invitacion || 'Desconocido'}</p>
              </div>
              <div className="card-footer">
                <button className="button" onClick={() => handleAccess(parent.id_usuario)}>
                  Ingresar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Accounts;
