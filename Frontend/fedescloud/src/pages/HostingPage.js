// src/pages/HostingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import HostingTypeStep from '../components/hosting/HostingTypeStep.js';
import ExistingHostingsList from '../components/hosting/ExistingHostingsList.js';
import { HOSTING_TYPES } from '../data/hostingData';

const HostingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new'); // 'new' para solicitar hosting, 'existing' para ver hostings adquiridos
  const [selectedType, setSelectedType] = useState(null);

  // Función para seleccionar el tipo de hosting
  const handleSelectType = (typeKey) => {
    setSelectedType(typeKey);
    // Redirigir a la página de selección de planes según el tipo
    if (typeKey === 'webHosting') {
      navigate('/hosting/web/plans');
    } else if (typeKey === 'wordpressHosting') {
      navigate('/hosting/wordpress/plans');
    } else {
      Swal.fire('Error', 'Tipo de hosting no reconocido.', 'error');
    }
  };

  return (
    <div className="hosting-page">
      <h2>Hosting</h2>
      <div className="tabs">
        <button
          className={activeTab === 'new' ? 'active' : ''}
          onClick={() => setActiveTab('new')}
        >
          Solicitar Hosting
        </button>
        <button
          className={activeTab === 'existing' ? 'active' : ''}
          onClick={() => setActiveTab('existing')}
        >
          Mis Hostings
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="new-hosting">
          {/* Aquí mostramos la selección del tipo de hosting */}
          <HostingTypeStep hostingTypes={HOSTING_TYPES} onSelectType={handleSelectType} />
        </div>
      )}

      {activeTab === 'existing' && (
        <div className="existing-hostings">
          {/* Este componente se encargará de obtener y mostrar los hostings adquiridos por el usuario */}
          <ExistingHostingsList />
        </div>
      )}
    </div>
  );
};

export default HostingPage;
