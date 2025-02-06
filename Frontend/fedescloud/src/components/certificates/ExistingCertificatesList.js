// src/components/certificates/ExistingCertificatesList.js
import React, { useState } from 'react';

const ExistingCertificatesList = ({
  isLoading,
  sslCertificates,
  onSearch,
  searchQuery,
  setSearchQuery,
  onSelectCertificate
}) => {
  // Asegurarse de que sslCertificates sea un arreglo
  const certificatesArray = Array.isArray(sslCertificates) ? sslCertificates : [];

  // Estado para el filtro por estado y fecha
  const [filterState, setFilterState] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Función auxiliar para mapear los estados devueltos por la API
  const mapStatus = (status) => {
    switch (status) {
      case "PENDING_ISSUANCE":
        return "Pendiente";
      case "ISSUED":
        return "Emitido";
      case "REVOKED":
        return "Revocado";
      default:
        return status;
    }
  };

  // Filtrar certificados combinando búsqueda, filtro de estado y de fecha.
  const filteredCertificates = certificatesArray
    .filter(cert => cert !== undefined && cert !== null) // descartar elementos no definidos
    .filter(cert => {
      // Convertir commonName a cadena para evitar undefined
      const commonName = cert.commonName || "";
      const matchesSearch = commonName.toLowerCase().includes(String(searchQuery || "").toLowerCase());

      // Mapear el estado y filtrar por el filtro seleccionado
      const mappedStatus = mapStatus(cert.estadoCertificado);
      const matchesState = filterState === "" || mappedStatus === filterState;

      // Filtrar por fecha: se asume que se filtra por la fecha de emisión
      let matchesDate = true;
      if (filterDate !== "") {
        // Convertir la fecha de emisión a formato ISO (YYYY-MM-DD)
        const emissionDate = cert.fechaEmision
          ? new Date(cert.fechaEmision).toISOString().split('T')[0]
          : "";
        matchesDate = emissionDate === filterDate;
      }

      return matchesSearch && matchesState && matchesDate;
    });

  return (
    <div className="existing-certificates">
      <div className="certificate-checker">
        <input 
          type="text" 
          placeholder="Buscar certificado por dominio..." 
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') onSearch(); }}
        />
        <button onClick={onSearch}>Buscar</button>
      </div>

      <div className="certificate-filters">
        <select 
          value={filterState} 
          onChange={(e) => setFilterState(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Emitido">Emitido</option>
          <option value="Revocado">Revocado</option>
        </select>
        <input 
          type="date" 
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p>Cargando certificados...</p>
      ) : (
        <div className="certificates-list">
          {filteredCertificates.length === 0 ? (
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
                {filteredCertificates.map(cert => (
                  <tr key={cert.goDaddyCertificateId || cert.certificateId}>
                    <td>{cert.commonName || "N/A"}</td>
                    <td>{cert.productType}</td>
                    <td>{mapStatus(cert.estadoCertificado)}</td>
                    <td>{cert.fechaEmision ? new Date(cert.fechaEmision).toLocaleDateString() : 'N/A'}</td>
                    <td>{cert.fechaExpiracion ? new Date(cert.fechaExpiracion).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button 
                        className="detail-btn" 
                        onClick={() => onSelectCertificate(cert.certificateId)}
                      >
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