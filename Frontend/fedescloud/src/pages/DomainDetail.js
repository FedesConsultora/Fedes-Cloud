// src/pages/DomainDetail.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const DomainDetail = () => {
  const { domainId } = useParams();
  const [domainDetail, setDomainDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomainDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId]);

  const fetchDomainDetail = async () => {
    try {
      const response = await fetch(`${config.API_URL}/dominios/${domainId}`, { // Removido /admin
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setDomainDetail(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener los detalles del dominio', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los detalles del dominio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/domains/${domainId}/edit`); // Asegúrate de que esta ruta exista en App.js
  };

  if (loading) {
    return <div>Cargando...</div>; // Puedes reemplazar con un spinner
  }

  if (!domainDetail) {
    return <div>No se encontraron detalles para este dominio.</div>;
  }

  return (
    <div className="domain-detail-page">
      <h2>Detalles del Dominio</h2>
      <div className="detail-container">
        <p><strong>Dominio:</strong> {domainDetail.nombreDominio}</p>
        <p><strong>Fecha Expiración:</strong> {domainDetail.fechaExpiracion ? new Date(domainDetail.fechaExpiracion).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Bloqueado:</strong> {domainDetail.bloqueado ? 'Sí' : 'No'}</p>
        <p><strong>Privacidad:</strong> {domainDetail.proteccionPrivacidad ? 'Sí' : 'No'}</p>
        <p><strong>Fecha de Creación:</strong> {new Date(domainDetail.createdAt).toLocaleDateString()}</p>
        {/* Agrega más detalles según tu API */}
        <button onClick={handleEdit} className="button edit-button">Editar Dominio</button>
      </div>
    </div>
  );
};

export default DomainDetail;