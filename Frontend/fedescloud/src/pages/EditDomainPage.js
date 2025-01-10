// src/pages/EditDomainPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const EditDomainPage = () => {
  const { domainId } = useParams();
  const [domainData, setDomainData] = useState({
    nombreDominio: '',
    fechaExpiracion: '',
    bloqueado: false,
    proteccionPrivacidad: false,
    // Otros campos según tu API
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomainData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId]);

  const fetchDomainData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/dominios/${domainId}`, { // Correcta URL API
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setDomainData(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener los datos del dominio', 'error');
        navigate('/admin'); // Opcional: Redirigir si no se encuentran datos
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los datos del dominio', 'error');
      navigate('/admin'); // Opcional: Redirigir en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDomainData({
      ...domainData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_URL}/dominios/${domainId}`, { // Correcta URL API
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(domainData),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Éxito', 'Dominio actualizado correctamente', 'success');
        navigate(`/admin/domains/${domainId}`);
      } else {
        Swal.fire('Error', data.message || 'No se pudo actualizar el dominio', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al actualizar el dominio', 'error');
    }
  };

  if (loading) {
    return <div>Cargando...</div>; // Puedes reemplazar con un spinner
  }

  return (
    <div className="edit-domain-page">
      <div className="edit-domain-container">
        <h2>Editar Dominio</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="nombreDominio">Dominio:</label>
            <input
              type="text"
              id="nombreDominio"
              name="nombreDominio"
              value={domainData.nombreDominio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fechaExpiracion">Fecha de Expiración:</label>
            <input
              type="date"
              id="fechaExpiracion"
              name="fechaExpiracion"
              value={domainData.fechaExpiracion}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bloqueado">Bloqueado:</label>
            <input
              type="checkbox"
              id="bloqueado"
              name="bloqueado"
              checked={domainData.bloqueado}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="proteccionPrivacidad">Protección de Privacidad:</label>
            <input
              type="checkbox"
              id="proteccionPrivacidad"
              name="proteccionPrivacidad"
              checked={domainData.proteccionPrivacidad}
              onChange={handleChange}
            />
          </div>
          {/* Agrega más campos según tu API */}
          <div className="button-group">
            <button type="button" className="button cancel-button" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="button save-button">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDomainPage;