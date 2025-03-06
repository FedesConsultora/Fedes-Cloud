// src/pages/WebHostingPlanPage.js
import React, { useState, useContext } from 'react';
import { HOSTING_PLANS } from '../data/hostingData.js';
import HostingPricingToggle from '../components/hosting/HostingPricingToggle.js';
import { FaArrowLeft } from 'react-icons/fa';
import { RiCheckboxIndeterminateLine } from 'react-icons/ri';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import { CartContext } from '../contexts/CartContext.js';
import config from '../config/config.js';
import Swal from 'sweetalert2';

const WebHostingPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, fetchCart } = useContext(CartContext);
  const [paymentMode, setPaymentMode] = useState('annual');

  const handleToggle = (mode) => {
    setPaymentMode(mode);
  };

  const renderIcon = (status) => {
    switch (status) {
      case 'double':
        return <RiCheckboxIndeterminateLine color="#f1c40f" />;
      case 'single':
        return <FaCheck color="#27ae60" />;
      case 'cross':
        return <FaTimes color="#e74c3c" />;
      default:
        return null;
    }
  };

  // Función para agregar el plan seleccionado al carrito
  const handleSelectPlan = async (plan) => {
    // Verificamos que ya exista un carrito activo
    if (!cart || !cart.id_carrito) {
      Swal.fire('Error', 'No se encontró un carrito activo. Por favor, intenta nuevamente.', 'error');
      return;
    }

    // Construimos el objeto itemData incluyendo id_carrito obtenido desde el contexto
    const itemData = {
      id_carrito: cart.id_carrito, // Este campo es obligatorio
      tipoProducto: 'HOSTING',
      productoId: plan.id, // Identificador del plan
      descripcion: plan.title,
      cantidad: 1,
      precioUnitario: paymentMode === 'monthly' ? plan.monthly.price : plan.annual.discountedPrice,
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
        Swal.fire('Agregado', 'El plan de hosting fue agregado al carrito', 'success');
        // Refrescamos el carrito en el contexto
        fetchCart();
        // Redirigimos a la página del carrito
        navigate('/carrito');
      } else {
        Swal.fire('Error', data.message || 'No se pudo agregar el plan al carrito', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="hosting-plan-page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} />
        </button>
        <h2>Planes de Web Hosting</h2>
      </div>

      <HostingPricingToggle paymentMode={paymentMode} onToggle={handleToggle} />

      <div className="plans-container">
        {HOSTING_PLANS.webHostingPlans.map((plan) => (
          <div key={plan.id} className="plan-card">
            {plan.bestSeller && <div className="badge">Más Vendido</div>}
            <h3>{plan.title}</h3>
            <p className="subtitle">{plan.subtitle}</p>
            <div className="prices">
              {paymentMode === 'monthly' ? (
                <p className="price">{plan.monthly.price} ARS /mes</p>
              ) : (
                <>
                  <p className="original-price">{plan.annual.originalPrice} ARS /mes</p>
                  <p className="discount-price">
                    {plan.annual.discountedPrice} ARS /mes <span className="discount-label">{plan.annual.discountLabel}</span>
                  </p>
                  {plan.annual.bonus && <p className="bonus">{plan.annual.bonus}</p>}
                </>
              )}
            </div>
            <ul className="features">
              {plan.features.map((item, i) => (
                <li key={i}>
                  {renderIcon(item.status)}
                  <span className="feature-text">{item.feature}</span>
                </li>
              ))}
            </ul>
            <button className="select-btn" onClick={() => handleSelectPlan(plan)}>
              Añadir al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebHostingPlanPage;
