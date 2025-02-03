// src/pages/CertificadosSSLPage.js
import React, { useState } from 'react';
import Swal from 'sweetalert2';

import { CERTIFICATE_TYPES, PLAN_OPTIONS } from '../data/certificateData.js';
import CertificateTypeStep from '../components/certificates/CertificateTypeStep.js';
import PlanSelectionStep from '../components/certificates/PlanSelectionStep.js';
import CertificateFormStep from '../components/certificates/CertificateFormStep.js';
import ExistingCertificatesList from '../components/certificates/ExistingCertificatesList.js';



const CertificadosSSLPage = () => {
  // Tabs: 'new' para solicitar, 'existing' para gestionar
  const [activeTab, setActiveTab] = useState('new');

  // Pasos internos: 1 -> tipo de certificado, 2 -> plan, 3 -> datos
  const [step, setStep] = useState(1);

  // Orden pendiente (simulada)
  const [pendingOrder, setPendingOrder] = useState(null);

  // Certificados (simulados)
  const [sslCertificates, setSslCertificates] = useState([
    {
      certificateId: '987654',
      domain: 'certificadoprueba.com',
      type: 'OV',
      status: 'Activo',
      issueDate: '2022-06-01',
      expiryDate: '2023-06-01',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    type: '',
    plan: '',
    domain: '',
    verificationEmail: '',
  });

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

  // Volver a paso anterior
  const handleBackToStep = (targetStep) => {
    setStep(targetStep);
  };

  // Manejador para inputs (Paso 3)
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Crear la orden pendiente
  const handleRequestCertificate = () => {
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
    setTimeout(() => {
      const newOrder = {
        certificateId: 'PEND-' + Math.floor(Math.random() * 1000000),
        type: formData.type,
        plan: formData.plan,
        domain: formData.domain.trim() || 'No Configurado',
        verificationEmail: formData.verificationEmail.trim(),
        status: 'Pendiente',
      };
      setPendingOrder(newOrder);
      setIsLoading(false);
      Swal.fire(
        'Orden Creada',
        `Has creado un certificado ${formData.type} con plan ${formData.plan}. Luego podrás configurar el dominio.`,
        'success'
      );
    }, 1000);
  };

  // Búsqueda en "Mis Certificados SSL"
  const [searchQuery, setSearchQuery] = useState('');
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

  // Seleccionar un certificado existente (detalle)
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
          {/* Si no hay orden pendiente, mostramos el wizard */}
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
                  onBack={() => handleBackToStep(1)}
                />
              )}

              {step === 3 && (
                <CertificateFormStep
                  formData={formData}
                  onBack={() => handleBackToStep(2)}
                  onChange={handleInputChange}
                  onSubmit={handleRequestCertificate}
                />
              )}
            </>
          )}

          {/* Si ya hay una orden pendiente */}
          {pendingOrder && (
            <div className="order-summary">
              <h3>Resumen de Orden Pendiente</h3>
              <p><strong>Tipo:</strong> {pendingOrder.type}</p>
              <p><strong>Plan:</strong> {pendingOrder.plan}</p>
              <p><strong>Dominio:</strong> {pendingOrder.domain}</p>
              <p><strong>Correo:</strong> {pendingOrder.verificationEmail}</p>
              <p className="order-message">
                Tu certificado ha sido creado en estado “Pendiente”. 
                Podrás configurar el dominio y finalizar la validación más tarde.
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

      <p className="info-text">
        En esta página podrás solicitar nuevos certificados SSL y gestionar los que ya tienes.
      </p>
    </div>
  );
};

export default CertificadosSSLPage;
