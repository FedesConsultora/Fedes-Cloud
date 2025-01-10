// src/components/admin/DomainsList.js

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const DomainsList = () => {
  const [domains, setDomains] = useState([]);
  const [searchDomain, setSearchDomain] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async (query = '') => {
    try {
      const response = await fetch(`${config.API_URL}/dominios?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setDomains(data.data || []);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener la lista de dominios', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener la lista de dominios', 'error');
    }
  };

  const handleSearch = () => {
    fetchDomains(searchDomain.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDomainClick = (domainId) => {
    navigate(`/dominios/${domainId}`);
  };

  const handleDelete = async (domainId) => {
    try {
      const response = await fetch(`${config.API_URL}/dominios/${domainId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Eliminado!', data.message, 'success');
        fetchDomains(); // Refrescar la lista
      } else {
        Swal.fire('Error', data.message || 'No se pudo eliminar el dominio', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al eliminar el dominio', 'error');
    }
  };

  const handleEdit = (domainId) => {
    navigate(`/dominios/${domainId}/edit`);
  };

  return (
    <div className="admin-section">
      <h3>Lista de Dominios en Propiedad</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar dominio..."
          value={searchDomain}
          onChange={(e) => setSearchDomain(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch} aria-label="Buscar dominios">
          <FaSearch />
        </button>
      </div>
      <div className="list-container">
        {domains.length === 0 ? (
          <p>No se encontraron dominios.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Dominio</th>
                <th>Fecha Expiración</th>
                <th>Bloqueado</th>
                <th>Privacidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((dominio) => (
                <tr key={dominio.id_dominio} onClick={() => handleDomainClick(dominio.id_dominio)}>
                  <td>{dominio.nombreDominio}</td>
                  <td>
                    {dominio.fechaExpiracion
                      ? new Date(dominio.fechaExpiracion).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{dominio.bloqueado ? 'Sí' : 'No'}</td>
                  <td>{dominio.proteccionPrivacidad ? 'Sí' : 'No'}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que el clic en el botón active la fila
                        handleEdit(dominio.id_dominio);
                      }}
                      className="action-button edit-button"
                      aria-label={`Editar dominio ${dominio.nombreDominio}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dominio.id_dominio);
                      }}
                      className="action-button delete-button"
                      aria-label={`Eliminar dominio ${dominio.nombreDominio}`}
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

export default DomainsList;
