// src/components/hosting/HostingPricingToggle.js
import React from 'react';

const HostingPricingToggle = ({ paymentMode, onToggle }) => {
  return (
    <div className="pricing-toggle">
      <button
        className={paymentMode === 'monthly' ? 'active' : ''}
        onClick={() => onToggle('monthly')}
      >
        Pago Mensual
      </button>
      <button
        className={paymentMode === 'annual' ? 'active' : ''}
        onClick={() => onToggle('annual')}
      >
        Pago Anual
      </button>
    </div>
  );
};

export default HostingPricingToggle;
