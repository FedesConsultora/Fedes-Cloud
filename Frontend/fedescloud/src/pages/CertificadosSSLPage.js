import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { CERTIFICATE_TYPES, PLAN_OPTIONS } from '../data/certificateData.js';
import CertificateTypeStep from '../components/certificates/CertificateTypeStep.js';
import PlanSelectionStep from '../components/certificates/PlanSelectionStep.js';
import CertificateFormStep from '../components/certificates/CertificateFormStep.js';
import ExistingCertificatesList from '../components/certificates/ExistingCertificatesList.js';

const CertificadosSSLPage = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [step, setStep] = useState(1);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [sslCertificates, setSslCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    plan: '',
    domain: '',
    verificationEmail: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Función para cargar certificados locales desde el backend
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/certificados`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire('Error', errorData.message || 'No se pudieron obtener los certificados', 'error');
        setIsLoading(false);
        return;
      }
      const result = await response.json();
      // Se espera que el backend devuelva { success: true, data: [ ... ] }
      setSslCertificates(result.data);
    } catch (err) {
      Swal.fire('Error', `Ocurrió un error al obtener los certificados: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar certificados al montar el componente
  useEffect(() => {
    // Solo se hace la llamada si el tab activo es "existing"
    if (activeTab === 'existing') {
      fetchCertificates();
    }
  }, [activeTab]);

  // Paso 1: Seleccionar tipo
  const handleSelectCertificateType = (typeKey) => {
    setFormData({ ...formData, type: typeKey });
    setStep(2);
  };

  // Paso 2: Seleccionar plan
  const handleSelectPlan = (planId) => {
    setFormData({ ...formData, plan: planId });
    setStep(3);
  };

  // Manejador de inputs (Paso 3)
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para crear la orden (crea el certificado local y llama a GoDaddy)
  const handleRequestCertificate = async () => {
    if (!formData.type) {
      Swal.fire('Advertencia', 'Selecciona un tipo de certificado.', 'warning');
      return;
    }
    if (!formData.plan) {
      Swal.fire('Advertencia', 'Selecciona el plan (duración).', 'warning');
      return;
    }
    if (!formData.verificationEmail.trim()) {
      Swal.fire('Advertencia', 'Ingresa un correo de verificación.', 'warning');
      return;
    }

    setIsLoading(true);

    // Determinar el período en días según el plan
    let period;
    if (formData.plan.includes('1 año')) {
      period = 365;
    } else if (formData.plan.includes('2 años')) {
      period = 730;
    } else if (formData.plan.includes('3 años')) {
      period = 1095;
    } else if (formData.plan.includes('5 años')) {
      period = 1825;
    } else {
      period = 60;
    }

    // Construir el payload para crear la orden en GoDaddy.
    const payloadCreate = {
      productType: formData.type === 'DV' ? 'DV_SSL' : formData.type === 'OV' ? 'OV_SSL' : 'EV_SSL',
      commonName: formData.domain.trim() || 'no-configurado.com',
      period: period,
      csr: '', // Se dejará vacío para que el backend lo genere 
      subjectAlternativeNames: [],
      contact: {
        email: formData.verificationEmail,
        nameFirst: 'John',
        nameLast: 'Doe',
      },
    };

    console.log('Payload enviado a crear orden:', payloadCreate);

    try {
      const responseCreate = await fetch(`${config.API_URL}/certificados/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(payloadCreate),
      });
      console.log('Response Status:', responseCreate.status);
      const resultCreate = await responseCreate.json();
      console.log('Response Data:', resultCreate);
      if (responseCreate.ok && resultCreate.success) {
        setPendingOrder(resultCreate.data);
        Swal.fire('Orden Creada', 'La orden de certificado ha sido creada exitosamente.', 'success');
      } else {
        Swal.fire('Error al crear la orden', resultCreate.message || 'No se pudo crear la orden', 'error');
      }
    } catch (err) {
      Swal.fire('Error', `Ocurrió un error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función de búsqueda en "Mis Certificados SSL"
  const handleSearchExisting = () => {
    if (!searchQuery.trim()) {
      Swal.fire('Advertencia', 'Ingresa un dominio para buscar certificados.', 'warning');
      return;
    }
    const filtered = sslCertificates.filter(cert =>
      cert.domain.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    setSslCertificates(filtered);
  };

  // Función para seleccionar un certificado (para ver detalles, etc.)
  const handleSelectCertificate = (certificateId) => {
    Swal.fire('Acción', `Seleccionaste el certificado ${certificateId}`, 'info');
  };

  return (
    <div className="certificados-ssl-page">
      <h2>Certificados SSL</h2>
      <div className="tabs">
        <button
          className={activeTab === 'new' ? 'active' : ''}
          onClick={() => setActiveTab('new')}
        >
          Solicitar Certificado SSL
        </button>
        <button
          className={activeTab === 'existing' ? 'active' : ''}
          onClick={() => setActiveTab('existing')}
        >
          Mis Certificados SSL
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="new-certificate">
          {!pendingOrder && (
            <>
              {step === 1 && (
                <CertificateTypeStep
                  certificateTypes={CERTIFICATE_TYPES}
                  onSelectType={handleSelectCertificateType}
                />
              )}
              {step === 2 && (
                <PlanSelectionStep
                  planOptions={PLAN_OPTIONS}
                  onSelectPlan={handleSelectPlan}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <CertificateFormStep
                  formData={formData}
                  onBack={() => setStep(2)}
                  onChange={handleInputChange}
                  onSubmit={handleRequestCertificate}
                />
              )}
            </>
          )}

          {pendingOrder && (
            <div className="order-summary">
              <h3>Resumen de Orden Pendiente</h3>
              <p><strong>Tipo:</strong> {pendingOrder.productType}</p>
              <p><strong>Plan:</strong> {formData.plan}</p>
              <p><strong>Dominio:</strong> {pendingOrder.commonName}</p>
              <p><strong>Correo:</strong> {pendingOrder.contact && pendingOrder.contact.email}</p>
              <p className="order-message">
                Tu certificado ha sido creado en estado “Pendiente”. Podrás configurar el dominio y finalizar la validación más tarde.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'existing' && (
        <ExistingCertificatesList
          isLoading={isLoading}
          sslCertificates={sslCertificates}
          onSearch={handleSearchExisting}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectCertificate={handleSelectCertificate}
        />
      )}
    </div>
  );
};

export default CertificadosSSLPage;