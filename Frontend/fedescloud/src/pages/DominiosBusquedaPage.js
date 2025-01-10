// src/pages/DominiosBusquedaPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Ícono para volver
import config from '../config/config.js';
import Swal from 'sweetalert2';

const DominiosBusquedaPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim()) {
      fetchDomainData(query.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Función unificada para "check domain" + "suggest domains"
  const fetchDomainData = async (rawQuery) => {
    // 1) Revisar si hay '.' -> check availability
    if (rawQuery.includes('.')) {
      await checkAvailability(rawQuery);
    }
    // 2) En todo caso, sugerir
    await suggestDomains(rawQuery);
  };

  const checkAvailability = async (dom) => {
    try {
      const response = await fetch(`${config.API_URL}/dominios/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain: dom }),
      });
      const data = await response.json();
      if (response.ok) {
        setAvailabilityResult(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudo chequear disponibilidad', 'error');
        setAvailabilityResult(null);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error interno del servidor', 'error');
    }
  };

  const suggestDomains = async (rawQuery) => {
    try {
      const response = await fetch(`${config.API_URL}/dominios/sugerir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: rawQuery, limit: 8, country: 'AR' }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.data || []);
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener sugerencias', 'error');
        setSuggestions([]);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error interno del servidor', 'error');
    }
  };

  return (
    <div className="dominios-busqueda-page">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          <FaArrowLeft /> Volver
        </button>
        <h2>Resultados de Búsqueda</h2>
      </div>

      <p>Buscaste: <strong>{query}</strong></p>

      {/* Mostrar resultado de disponibilidad (si query tenía punto) */}
      {availabilityResult && (
        <div className="domain-check-result">
          <h3>Disponibilidad</h3>
          <p><strong>Dominio:</strong> {availabilityResult.domain}</p>
          <p><strong>Disponible:</strong> {availabilityResult.available ? 'Sí' : 'No'}</p>
          {typeof availabilityResult.price === 'number' && (
            <p><strong>Precio:</strong> {availabilityResult.price} {availabilityResult.currency || 'USD'}</p>
          )}
        </div>
      )}

      {/* Mostrar sugerencias siempre */}
      {suggestions.length > 0 && (
        <div className="domain-suggestions">
          <h3>Otras opciones similares</h3>
          <ul>
            {suggestions.map((sug, idx) => (
              <li key={idx}>{sug.domain}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Si no hay disponibilidadResult y no hay suggestions, puede ser que no se encontró nada */}
      {(!availabilityResult && suggestions.length === 0) && (
        <p>No se encontraron datos para la búsqueda.</p>
      )}
    </div>
  );
};

export default DominiosBusquedaPage;
