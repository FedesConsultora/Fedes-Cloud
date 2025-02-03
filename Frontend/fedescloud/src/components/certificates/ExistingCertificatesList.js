// src/components/certificates/ExistingCertificatesList.js
import React from 'react';

const ExistingCertificatesList = ({
  isLoading,
  sslCertificates,
  onSearch,
  searchQuery,
  setSearchQuery,
  onSelectCertificate
}) => {
  return (
    <div className="existing-certificates">
      <div className="certificate-checker">
        <input 
          type="text" 
          placeholder="Buscar certificado por dominio..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') onSearch(); }}
        />
        <button onClick={onSearch}>Buscar</button>
      </div>

      {isLoading ? (
        <p>Cargando certificados...</p>
      ) : (
        <div className="certificates-list">
          {sslCertificates.length === 0 ? (
            <p>No tienes certificados SSL registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Dominio</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Expiración</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sslCertificates.map(cert => (
                  <tr key={cert.certificateId}>
                    <td>{cert.domain}</td>
                    <td>{cert.type}</td>
                    <td>{cert.status}</td>
                    <td>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button className="detail-btn" onClick={() => onSelectCertificate(cert.certificateId)}>
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ExistingCertificatesList;
