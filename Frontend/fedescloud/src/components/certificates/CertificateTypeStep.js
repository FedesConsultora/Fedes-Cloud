// src/components/certificates/CertificateTypeStep.js
import React from 'react';

const CertificateTypeStep = ({ certificateTypes, onSelectType }) => {
  return (
    <div className="certificate-cards">
      {Object.entries(certificateTypes).map(([key, data]) => (
        <div className="certificate-card" key={key}>
          <h3>Certificado</h3>
          <h4>{data.name}</h4>
          <ul className="features">
            {data.features.map((feature, i) => (
              <li key={i}>✓ {feature}</li>
            ))}
          </ul>
          <div className="prices">
            <p className="regular-price">{data.regularPrice} USD</p>
            <p className="discount-price">
              {data.discountPrice} USD <span>{data.discountLabel}</span>
            </p>
            <p className="note">*Precios anuales sin IVA</p>
          </div>
          <button
            className="select-btn"
            onClick={() => onSelectType(key)}
          >
            SOLICITAR
          </button>
          {key === 'DV' && <div className="badge">¡Más solicitado!</div>}
        </div>
      ))}
    </div>
  );
};

export default CertificateTypeStep;
