// src/pages/WordPressHostingPlanPage.js
import React, { useState } from 'react';
import { HOSTING_PLANS } from '../data/hostingData.js';
import HostingPricingToggle from '../components/hosting/HostingPricingToggle.js';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { RiCheckboxIndeterminateLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const WordPressHostingPlanPage = () => {
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState('annual'); // por defecto anual

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

  return (
    <div className="hosting-plan-page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} />
        </button>
        <h2>Planes de WordPress Hosting</h2>
      </div>
      
      <HostingPricingToggle paymentMode={paymentMode} onToggle={handleToggle} />

      <div className="plans-container">
        {HOSTING_PLANS.wordpressHostingPlans.map(plan => (
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
            <button className="select-btn">CONTINUAR</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordPressHostingPlanPage;
