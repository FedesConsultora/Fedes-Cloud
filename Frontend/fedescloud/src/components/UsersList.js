// src/components/admin/UsersList.js

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';
import debounce from 'lodash.debounce';

const UsersList = () => {
  const [allUsers, setAllUsers] = useState([]); // Lista completa de usuarios
  const [displayedUsers, setDisplayedUsers] = useState([]); // Usuarios filtrados
  const [searchUser, setSearchUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para obtener usuarios del servidor
  const fetchUsers = async (query = '') => {
    try {
      const response = await fetch(`${config.API_URL}/users?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Ajusta según cómo manejes la autenticación
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAllUsers(data.data || []);
        setDisplayedUsers(data.data || []);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener la lista de usuarios', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener la lista de usuarios', 'error');
    }
  };

  // Función para manejar el filtrado en tiempo real (Client-Side)
  const handleClientSideFilter = useCallback(
    debounce((query) => {
      if (!query) {
        setDisplayedUsers(allUsers);
      } else {
        const filtered = allUsers.filter((user) =>
          `${user.nombre} ${user.apellido}`.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          (user.rol && user.rol.nombre.toLowerCase().includes(query.toLowerCase())) ||
          (user.estado && user.estado.nombre.toLowerCase().includes(query.toLowerCase()))
        );
        setDisplayedUsers(filtered);
      }
    }, 300), // 300ms de debounce
    [allUsers]
  );

  // useEffect para filtrar en tiempo real cuando cambia searchUser
  useEffect(() => {
    handleClientSideFilter(searchUser.trim());
  }, [searchUser, handleClientSideFilter]);

  // Función para manejar la búsqueda en el servidor (Server-Side)
  const handleServerSideSearch = async () => {
    const query = searchUser.trim();
    if (!query) {
      Swal.fire('Información', 'Por favor, ingresa un término de búsqueda.', 'info');
      return;
    }
    await fetchUsers(query);
  };

  const handleSearchClick = () => {
    handleServerSideSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleServerSideSearch();
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDelete = async (userId) => {
    try {
      const confirmResult = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres eliminar este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmResult.isConfirmed) {
        const response = await fetch(`${config.API_URL}/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Asegúrate de incluir el token si es necesario
          },
        });
        const data = await response.json();
        if (response.ok) {
          Swal.fire('Eliminado!', data.message, 'success');
          fetchUsers(searchUser.trim());
        } else {
          Swal.fire('Error', data.message || 'No se pudo eliminar el usuario', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al eliminar el usuario', 'error');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/admin/users/${userId}/edit`); // Navegar a la ruta frontend correcta
  };

  return (
    <div className="admin-section">
      <h3>Lista de Usuarios</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearchClick} aria-label="Buscar usuarios">
          <FaSearch />
        </button>
      </div>
      <div className="list-container">
        {displayedUsers.length === 0 ? (
          <p>No se encontraron usuarios.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((usuario) => (
                <tr key={usuario.id_usuario} onClick={() => handleUserClick(usuario.id_usuario)}>
                  <td>{`${usuario.nombre} ${usuario.apellido}`}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol ? usuario.rol.nombre : 'N/A'}</td>
                  <td>{usuario.estado ? usuario.estado.nombre : 'N/A'}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(usuario.id_usuario);
                      }}
                      className="action-button edit-button"
                      aria-label={`Editar usuario ${usuario.nombre}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(usuario.id_usuario);
                      }}
                      className="action-button delete-button"
                      aria-label={`Eliminar usuario ${usuario.nombre}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersList;