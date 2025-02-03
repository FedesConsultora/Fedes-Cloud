// src/components/certificates/PlanSelectionStep.js
import React from 'react';

const PlanSelectionStep = ({ planOptions, onSelectPlan, onBack }) => {
  return (
    <div className="plan-selection">
      <h3>Selecciona el plazo de tu plan</h3>
      <p>Consigue un mejor precio contratándolo por varios años.</p>

      <div className="horizontal-plans">
        {planOptions.map(plan => (
          <div
            className="plan-card"
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
          >
            <h4>{plan.id}</h4>
            <p className="discounted-price">${plan.discountedPrice}/año</p>
            <p className="original-price">${plan.originalPrice}/año</p>
            <p className="discount-note">En oferta ({plan.discountNote})</p>
          </div>
        ))}
      </div>
      <div className="plan-buttons">
        <button className="back-btn" onClick={onBack}>
          Volver a seleccionar tipo
        </button>
      </div>
    </div>
  );
};

export default PlanSelectionStep;
