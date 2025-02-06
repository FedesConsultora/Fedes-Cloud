import React, { useState } from 'react';
import Swal from 'sweetalert2';
import config from '../../config/config.js';

const CertificateFormStep = ({ formData, onBack, onSubmit, onChange }) => {
  const [isProcessing, setIsProcessing] = useState(false); // Controla el estado de procesamiento

  // Función combinada que primero valida y luego crea la orden
  const handleCombinedSubmit = async () => {
    if (isProcessing) return; // Evita que se ejecuten múltiples veces

    setIsProcessing(true); // Inicia el proceso

    // Validación básica: se requiere al menos un correo
    if (!formData.verificationEmail.trim()) {
      Swal.fire('Advertencia', 'Ingresa un correo de verificación.', 'warning');
      setIsProcessing(false);
      return;
    }

    // Determinar el periodo válido según el plan
    let period;
    if (formData.plan.includes('1 año')) {
      period = 365; // 1 año en días
    } else if (formData.plan.includes('2 años')) {
      period = 730; // 2 años en días
    } else if (formData.plan.includes('3 años')) {
      period = 1095; // 3 años en días
    } else {
      period = 60; // Valor mínimo en días, para evitar el error de la API
    }

    // Construir el payload de validación según lo que exige la API de GoDaddy
    const payload = {
      productType: formData.type === 'DV' ? 'DV_SSL' : formData.type === 'OV' ? 'OV_SSL' : 'EV_SSL',
      commonName: formData.domain || '',
      period: period, // Asignar el valor calculado para el período en días
      csr: '', // Si no manejas un CSR en este momento
      subjectAlternativeNames: [],
      contact: {
        email: formData.verificationEmail,
        nameFirst: 'John',
        nameLast: 'Doe',
      },
    };

    try {
      // Llamada al endpoint de validación de la orden
      console.log('Payload enviado a validación:', payload);
      const responseValidate = await fetch(`${config.API_URL}/certificados/validate-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      console.log('Respuesta de validación:', responseValidate);
      const resultValidate = await responseValidate.json();
      console.log('Resultado de validación:', resultValidate);

      // Si la validación falla
      if (!responseValidate.ok || !resultValidate.success) {
        Swal.fire(
          'Error en validación',
          resultValidate.message || 'No se pudo validar la orden',
          'error'
        );
        setIsProcessing(false);
        return;
      }

      // Si la validación fue exitosa, se procede a crear la orden
      await onSubmit(); // Llamar a la función onSubmit del componente padre
      Swal.fire(
        'Certificado Solicitado',
        'La orden de certificado ha sido validada y creada exitosamente.',
        'success'
      );
    } catch (err) {
      Swal.fire('Error', `Ocurrió un error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="certificate-request-form">
      <div className="form-header">
        <h3>Completa tu Solicitud</h3>
        <button className="back-btn" onClick={onBack}>Volver al plan</button>
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

      {/* Botón combinado que primero valida y luego crea la orden */}
      <button
        className="request-btn"
        onClick={handleCombinedSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? 'Procesando...' : 'Solicitar Certificado SSL'}
      </button>
    </div>
  );
};

export default CertificateFormStep;
