// src/components/hosting/HostingTypeStep.js
import React from 'react';

const HostingTypeStep = ({ hostingTypes, onSelectType }) => {
  return (
    <div className="hosting-type-cards">
      {Object.entries(hostingTypes).map(([key, data]) => (
        <div className="hosting-type-card" key={key} onClick={() => onSelectType(key)}>
          <h3>{data.title}</h3>
          <p className="description">{data.description}</p>
          <ul className="features">
            {data.features.map((feature, i) => (
              <li key={i}>✓ {feature}</li>
            ))}
          </ul>
          <button className="select-btn">Seleccionar</button>
          {data.badge && <div className="badge">{data.badge}</div>}
        </div>
      ))}
    </div>
  );
};

export default HostingTypeStep;
