// src/pages/DominiosPage.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa'; // Importar el ícono de lupa
import { AuthContext } from '../contexts/AuthContext.js';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const DominiosPage = () => {
  const { user } = useContext(AuthContext); // Usaremos 'user' para mostrar información si lo deseas
  const [localDominios, setLocalDominios] = useState([]);
  const [searchDomain, setSearchDomain] = useState('');
  const navigate = useNavigate();

  // Cargar dominios locales al montar
  useEffect(() => {
    fetchLocalDominios();
  }, []);

  // Función para obtener los dominios locales desde la API
  const fetchLocalDominios = async () => {
    try {
      const response = await fetch(`${config.API_URL}/dominios`, {
        method: 'GET',
        credentials: 'include', 
      });
      const data = await response.json();
      if (response.ok) {
        setLocalDominios(data.data || []);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener los dominios', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener dominios locales', 'error');
    }
  };

  // Al presionar la lupa, navegar a la página de búsqueda con el query
  const handleSearch = () => {
    if (!searchDomain.trim()) {
      Swal.fire('Advertencia', 'Por favor, ingresa un dominio o palabra clave para buscar.', 'warning');
      return;
    }
    // Navega a /dominios/busqueda con query param
    navigate(`/dominios/busqueda?query=${encodeURIComponent(searchDomain.trim())}`);
  };

  return (
    <div className="dominios-page">
      <h2>Gestión de Dominios</h2>

      {/* Opcional: Mostrar información del usuario */}
      {user && (
        <div className="user-info">
          <p>Bienvenido, {user.nombre || 'Usuario'}!</p>
        </div>
      )}

      <div className="domain-checker">
        <input
          type="text"
          placeholder="Ingresa un dominio o palabra clave (ej: misitio o misitio.com)"
          value={searchDomain}
          onChange={(e) => setSearchDomain(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button onClick={handleSearch} aria-label="Buscar dominios">
          <FaSearch />
        </button>
      </div>

      <div className="local-domains">
        <h3>Mis Dominios</h3>
        {localDominios.length === 0 ? (
          <p>No tienes dominios registrados.</p>
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
              {localDominios.map((dominio) => (
                <tr key={dominio.id_dominio}>
                  <td>{dominio.nombreDominio}</td>
                  <td>
                    {dominio.fechaExpiracion
                      ? new Date(dominio.fechaExpiracion).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{dominio.bloqueado ? 'Sí' : 'No'}</td>
                  <td>{dominio.proteccionPrivacidad ? 'Sí' : 'No'}</td>
                  <td>
                    {/* Botones de editar/eliminar local o acciones extras */}
                    {/* Ejemplo: */}
                    {/* <button onClick={() => handleEdit(dominio.id_dominio)}>Editar</button>
                    <button onClick={() => handleDelete(dominio.id_dominio)}>Eliminar</button> */}
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

export default DominiosPage;