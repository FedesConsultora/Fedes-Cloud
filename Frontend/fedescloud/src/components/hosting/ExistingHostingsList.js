// src/components/hosting/ExistingHostingsList.js
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import config from '../../config/config.js';

const ExistingHostingsList = () => {
  const [hostings, setHostings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHostings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/hostings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setHostings(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudieron obtener los hostings', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al obtener hostings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostings();
  }, []);

  return (
    <div className="existing-hostings-list">
      <h2>Mis Hostings</h2>
      {isLoading ? (
        <p>Cargando hostings...</p>
      ) : hostings.length === 0 ? (
        <p>No tienes hostings adquiridos.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Plan</th>
              <th>Dominio</th>
              <th>Estado</th>
              <th>Fecha Expiración</th>
            </tr>
          </thead>
          <tbody>
            {hostings.map((hosting) => (
              <tr key={hosting.id_hosting}>
                <td>{hosting.id_hosting}</td>
                <td>{hosting.tipoHosting}</td>
                <td>{hosting.planName}</td>
                <td>{hosting.dominio || '-'}</td>
                <td>{hosting.estadoHosting ? hosting.estadoHosting.nombre : '-'}</td>
                <td>
                  {hosting.fechaExpiracion
                    ? new Date(hosting.fechaExpiracion).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExistingHostingsList;
