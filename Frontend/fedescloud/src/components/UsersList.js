// src/components/admin/UsersList.js

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query = '') => {
    try {
      const response = await fetch(`${config.API_URL}/users?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.data || []);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener la lista de usuarios', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener la lista de usuarios', 'error');
    }
  };

  const handleSearch = () => {
    fetchUsers(searchUser.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}`); // Navegar a la ruta frontend correcta
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`${config.API_URL}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Eliminado!', data.message, 'success');
        fetchUsers(); // Refrescar la lista
      } else {
        Swal.fire('Error', data.message || 'No se pudo eliminar el usuario', 'error');
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
        <button onClick={handleSearch} aria-label="Buscar usuarios">
          <FaSearch />
        </button>
      </div>
      <div className="list-container">
        {users.length === 0 ? (
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
              {users.map((usuario) => (
                <tr key={usuario.id_usuario} onClick={() => handleUserClick(usuario.id_usuario)}>
                  <td>{`${usuario.nombre} ${usuario.apellido}`}</td><td>{usuario.email}</td><td>{usuario.Rol.nombre}</td><td>{usuario.Estado.nombre}</td><td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que el clic en el botón active la fila
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
