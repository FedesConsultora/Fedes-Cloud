import React from 'react';

const WebHostingPlanCard = ({ plan, onSelectPlan, onViewDetails }) => {
  return (
    <div className="plan-card">
      <h3>{plan.title}</h3>
      <p className="subtitle">{plan.subtitle}</p>
      <div className="pricing">
        <p className="original-price">${plan.originalPrice}</p>
        <p className="discount-label">{plan.discountLabel}</p>
        <p className="discounted-price">${plan.discountedPrice} <span>{plan.billingCycle}</span></p>
        <p className="bonus">{plan.bonus}</p>
      </div>
      <ul className="features">
        {plan.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <button className="continue-btn" onClick={() => onSelectPlan(plan.id)}>
        CONTINUAR
      </button>
      <button className="details-btn" onClick={() => onViewDetails(plan.id)}>
        Ver todas las características
      </button>
    </div>
  );
};

export default WebHostingPlanCard;
