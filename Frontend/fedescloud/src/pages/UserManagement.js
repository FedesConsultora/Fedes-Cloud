// src/pages/UserManagement.js
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import InviteUser from './InviteUser.js'; // Componente de invitación (usado tanto para agregar como para editar)
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const UserManagement = () => {
  // Estado para la pestaña activa: "miCuenta" o "asignado"
  const [activeTab, setActiveTab] = useState('miCuenta');
  // Estado para la lista de subusuarios (usuarios que has invitado)
  const [subUsers, setSubUsers] = useState([]);
  // Estado para la lista de cuentas padre (a las que estás vinculado)
  const [parentAccounts, setParentAccounts] = useState([]);
  // Estado para la lista de invitaciones pendientes (para unirse a otras cuentas)
  const [pendingInvitations, setPendingInvitations] = useState([]);
  // Estado para el modal de agregar/editar cuenta
  const [showModal, setShowModal] = useState(false);
  // Modo del modal: "invite" o "edit"
  const [modalMode, setModalMode] = useState('invite');
  // Datos iniciales para el modal en caso de edición
  const [editData, setEditData] = useState(null);

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
        console.log(result)
        setSubUsers(result.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener la lista de subusuarios', 'error');
      }
    } catch (error) {
      console.error('Error fetching subusuarios:', error);
    }
  };

  // Función para obtener las cuentas padre a la que estás vinculado
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
        setParentAccounts(result.data);
      } else {
        Swal.fire('Error', 'No se pudo obtener las cuentas padre', 'error');
      }
    } catch (error) {
      console.error('Error fetching parent accounts:', error);
    }
  };

  // Función para obtener las invitaciones pendientes
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

  // Confirmación antes de desvincular
  const handleUnlink = async (idSubUser) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción desvinculará al usuario. ¡No se podrá revertir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desvincular',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
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
      }
    });
  };

  // Función para abrir el modal en modo edición
  const handleEdit = (subUser) => {
    setModalMode('edit');
    setEditData(subUser);
    setShowModal(true);
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
            <div className="mi-cuenta-header">
              <h3>
                Invita hasta diez usuarios para que formen parte de tu cuenta y decide qué funciones pueden desempeñar.
              </h3>
              {/* En modo "miCuenta", el botón de agregar cuenta se coloca arriba a la derecha */}
              <button className="button add-button" onClick={() => {
                setModalMode('invite');
                setEditData(null);
                setShowModal(true);
              }}>
                Agregar cuenta
              </button>
            </div>
            <p>
              Titular de la cuenta: <strong>{user.email}</strong>
            </p>
            {subUsers && subUsers.length > 0 ? (
              <table className="subusers-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {subUsers.map((subUser) => (
                    <tr key={subUser.id_usuario}>
                      <td>{subUser.email}</td>
                      <td>
                        {subUser.subRol}
                        {subUser.permitirSoporte && (
                          <span className="support-access"> (Acceso a Soporte)</span>
                        )}
                      </td>
                      <td>{subUser.estado_invitacion}</td>
                      <td>
                        <div className="actions">
                          <button className="icon-button" onClick={() => handleEdit(subUser)}>
                            <FaPencilAlt />
                          </button>
                          <button className="icon-button" onClick={() => handleUnlink(subUser.id_usuario)}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                Actualmente, no tienes usuarios en tu cuenta. Cuando los tengas, su información aparecerá aquí.
              </p>
            )}
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
              <p>No estás vinculado a ninguna cuenta.</p>
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
                <p>No tienes invitaciones pendientes.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <InviteUser
              mode={modalMode}
              initialData={editData}
              onClose={() => {
                setShowModal(false);
                // Al cerrar el modal (tanto en modo "invite" como "edit"), refrescamos la lista de subusuarios
                fetchSubUsers();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;