// src/pages/HostingTypePage.js
import React, { useState } from 'react';
import HostingTypeStep from '../components/hosting/HostingTypeStep.js';
import { HOSTING_TYPES } from '../data/hostingData.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const HostingTypePage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = (typeKey) => {
    setSelectedType(typeKey);
    // Redirigir a la página de selección de plan correspondiente según el tipo
    if (typeKey === 'webHosting') {
      navigate('/hosting/web/plans');
    } else if (typeKey === 'wordpressHosting') {
      navigate('/hosting/wordpress/plans');
    } else {
      Swal.fire('Error', 'Tipo de hosting no reconocido.', 'error');
    }
  };

  return (
    <div className="hosting-type-page">
      <h2>Elige el Tipo de Hosting</h2>
      <HostingTypeStep hostingTypes={HOSTING_TYPES} onSelectType={handleSelectType} />
    </div>
  );
};

export default HostingTypePage;
