// src/pages/UserManagement.js
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import InviteUser from './InviteUser.js'; // Componente de invitación
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';

const UserManagement = () => {
  // Estado para la pestaña activa: "miCuenta" o "asignado"
  const [activeTab, setActiveTab] = useState('miCuenta');
  // Estado para la lista de subusuarios (usuarios que has invitado)
  const [subUsers, setSubUsers] = useState([]);
  // Estado para la lista de cuentas padre (a las que estás vinculado)
  const [parentAccounts, setParentAccounts] = useState([]);
  // Estado para la lista de invitaciones pendientes (para unirse a otras cuentas)
  const [pendingInvitations, setPendingInvitations] = useState([]);
  // Estado para el modal de agregar cuenta
  const [showModal, setShowModal] = useState(false);

  const { user } = useContext(AuthContext);

  // Función para obtener los subusuarios que has invitado
  const fetchSubUsers = async () => {
    try {
      const response = await fetch(`${config.API_URL}/user-composite/subusuarios`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setSubUsers(result.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener la lista de subusuarios', 'error');
      }
    } catch (error) {
      console.error('Error fetching subusuarios:', error);
    }
  };

  // Función para obtener la(s) cuenta(s) padre a la que estás vinculado
  const fetchParentAccounts = async () => {
    try {
      const response = await fetch(`${config.API_URL}/user-composite/parents`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setParentAccounts(result.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener las cuentas padre', 'error');
      }
    } catch (error) {
      console.error('Error fetching parent accounts:', error);
    }
  };

  // Función para obtener las invitaciones pendientes (si se implementa ese endpoint)
  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch(`${config.API_URL}/user-composite/invitaciones`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setPendingInvitations(result.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener las invitaciones pendientes', 'error');
      }
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'miCuenta') {
      fetchSubUsers();
    } else if (activeTab === 'asignado') {
      fetchParentAccounts();
      fetchPendingInvitations();
    }
  }, [activeTab]);

  const handleUnlink = async (idSubUser) => {
    try {
      const response = await fetch(`${config.API_URL}/user-composite/${idSubUser}/unlink`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
      });
      if (response.ok) {
        Swal.fire('Éxito', 'Subusuario desvinculado exitosamente', 'success');
        fetchSubUsers();
      } else {
        Swal.fire('Error', 'No se pudo desvincular el subusuario', 'error');
      }
    } catch (error) {
      console.error('Error unlinking subuser:', error);
      Swal.fire('Error', 'Hubo un problema al desvincular el subusuario', 'error');
    }
  };

  return (
    <div className="user-management">
      <h2>Gestión de Usuarios</h2>
      <p>
        Coordina las funciones de los integrantes de tu cuenta y gestiona tu rol en las invitaciones recibidas.
        Infórmate sobre la gestión de usuarios con nuestro <a href="/tutorial-gestion-usuarios">tutorial</a>.
      </p>
      <div className="management-tabs">
        <button
          className={activeTab === 'miCuenta' ? 'active' : ''}
          onClick={() => setActiveTab('miCuenta')}
        >
          Mi cuenta
        </button>
        <button
          className={activeTab === 'asignado' ? 'active' : ''}
          onClick={() => setActiveTab('asignado')}
        >
          Asignado a otras cuentas
        </button>
      </div>
      <div className="management-content">
        {activeTab === 'miCuenta' && (
          <div className="mi-cuenta-section">
            <h3>Invita hasta diez usuarios para que formen parte de tu cuenta</h3>
            <p>
              Titular de la cuenta: <strong>{user.email}</strong>
            </p>
            {subUsers && subUsers.length > 0 ? (
              <ul className="subusers-list">
                {subUsers.map((subUser) => (
                  <li key={subUser.id_usuario}>
                    <div>
                      <span>{subUser.email}</span> - <span>{subUser.subRol}</span>
                    </div>
                    <button onClick={() => handleUnlink(subUser.id_usuario)}>
                      Desvincular
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Actualmente, no tienes usuarios en tu cuenta. Cuando los tengas, su información aparecerá aquí.
              </p>
            )}
            <button className="button" onClick={() => setShowModal(true)}>
              Agregar cuenta
            </button>
          </div>
        )}
        {activeTab === 'asignado' && (
          <div className="asignado-section">
            <h3>Cuentas a las que has sido invitado</h3>
            {parentAccounts && parentAccounts.length > 0 ? (
              <div className="parent-accounts">
                <h4>Cuenta(s) Padre</h4>
                <ul className="parents-list">
                  {parentAccounts.map((parent) => (
                    <li key={parent.id_usuario}>
                      <div>
                        <span>{parent.email}</span> - <span>{parent.nombre} {parent.apellido}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>
                No estás vinculado a ninguna cuenta.
              </p>
            )}
            <div className="pending-invitations">
              <h4>Invitaciones Pendientes</h4>
              {pendingInvitations && pendingInvitations.length > 0 ? (
                <ul className="invitaciones-list">
                  {pendingInvitations.map((inv) => (
                    <li key={inv.id_usuario}>
                      <div>
                        <span>{inv.email}</span> - <span>{inv.subRol}</span>
                      </div>
                      {/* Aquí podrías agregar botones para aceptar/rechazar la invitación */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  No tienes invitaciones pendientes.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <InviteUser onClose={() => { setShowModal(false); fetchSubUsers(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
