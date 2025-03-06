// src/components/certificates/CertificateFormStep.jsx
import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import config from '../../config/config.js';
import { CartContext } from '../../contexts/CartContext.js';
import { AuthContext } from '../../contexts/AuthContext.js';
import { CERTIFICATE_TYPES, PLAN_OPTIONS } from '../../data/certificateData.js';

const CertificateFormStep = ({ formData, onBack, onChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // Buscamos el plan seleccionado (se asume que formData.plan contiene un identificador)
  const selectedPlan = PLAN_OPTIONS.find((option) => option.id === formData.plan);

  const handleAddCertificateToCart = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Validaciones básicas
    if (!formData.type) {
      Swal.fire('Advertencia', 'Selecciona un tipo de certificado.', 'warning');
      setIsProcessing(false);
      return;
    }
    if (!formData.plan) {
      Swal.fire('Advertencia', 'Selecciona el plan (duración).', 'warning');
      setIsProcessing(false);
      return;
    }
    if (!formData.verificationEmail.trim()) {
      Swal.fire('Advertencia', 'Ingresa un correo de verificación.', 'warning');
      setIsProcessing(false);
      return;
    }

    // Verificar que exista un carrito activo
    if (!cart || !cart.id_carrito) {
      Swal.fire('Error', 'No se encontró un carrito activo. Por favor, intenta nuevamente.', 'error');
      setIsProcessing(false);
      return;
    }

    // Determinar el período en días según el plan
    let period;
    console.log('plan', formData.plan);
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

    // Definir el precio unitario para el certificado (según el plan seleccionado)
    const precioUnitario = selectedPlan ? selectedPlan.discountedPrice : 0;

    // Construir el objeto del ítem para agregar al carrito.
    // Se utiliza la información del usuario (nombre y apellido) obtenida del AuthContext.
    const itemData = {
      id_carrito: cart.id_carrito,
      tipoProducto: 'CERTIFICADO_SSL',
      productoId: formData.type, // Podrías combinar formData.type y formData.plan si es necesario
      descripcion: `${CERTIFICATE_TYPES[formData.type].name} - ${formData.plan}`,
      cantidad: 1,
      precioUnitario,
      metaDatos: {
        domain: formData.domain?.trim() || null,
        verificationEmail: formData.verificationEmail,
        period, // en días
        // Agregamos los nombres del usuario para evitar hardcodear "John Doe"
        contact: {
          nameFirst: user?.nombre || '',
          nameLast: user?.apellido || '',
        },
      }
    };

    try {
      const response = await fetch(`${config.API_URL}/cart-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Agregado', 'El certificado SSL fue agregado al carrito.', 'success');
        await fetchCart();
      } else {
        Swal.fire('Error', data.message || 'No se pudo agregar el certificado al carrito.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
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

      <button
        className="request-btn"
        onClick={handleAddCertificateToCart}
        disabled={isProcessing}
      >
        {isProcessing ? 'Procesando...' : 'Agregar Certificado SSL al Carrito'}
      </button>
    </div>
  );
};

export default CertificateFormStep;
