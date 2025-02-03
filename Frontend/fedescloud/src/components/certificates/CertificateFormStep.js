// src/components/certificates/CertificateFormStep.js
import React from 'react';

const CertificateFormStep = ({ formData, onBack, onChange, onSubmit }) => {
  return (
    <div className="certificate-request-form">
      <div className="form-header">
        <h3>Completa tu Solicitud</h3>
        <button className="back-btn" onClick={onBack}>
          Volver al plan
        </button>
      </div>
      <div className="summary-box">
        <p><strong>Tipo:</strong> {formData.type}</p>
        <p><strong>Plan:</strong> {formData.plan}</p>
      </div>

      <div className="form-group">
        <label>Dominio (opcional):</label>
        <input
          type="text"
          name="domain"
          placeholder="ej: misitio.com (o dejar vacío)"
          value={formData.domain}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <label>Correo de Verificación:</label>
        <input
          type="email"
          name="verificationEmail"
          placeholder="ej: correo@ejemplo.com"
          value={formData.verificationEmail}
          onChange={onChange}
        />
      </div>
      <button className="request-btn" onClick={onSubmit}>
        Solicitar Certificado SSL
      </button>
    </div>
  );
};

export default CertificateFormStep;
