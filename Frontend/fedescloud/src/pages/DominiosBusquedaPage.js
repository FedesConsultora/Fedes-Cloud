// src/pages/DominiosBusquedaPage.js

import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import config from '../config/config.js';
import Swal from 'sweetalert2';
import { AuthContext } from '../contexts/AuthContext.js';
import { Player } from '@lottiefiles/react-lottie-player'; // Importar el Player de lottie-react

const DominiosBusquedaPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar la animación de carga
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (query.trim()) {
      fetchDomainData(query.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Función unificada para "check domain" + "suggest domains"
  const fetchDomainData = async (rawQuery) => {
    setIsLoading(true); // Iniciar animación de carga
    try {
      // 1) Revisar si hay '.' -> check availability
      if (rawQuery.includes('.')) {
        await checkAvailability(rawQuery);
      }
      // 2) En todo caso, sugerir
      await suggestDomains(rawQuery);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener los datos del dominio', 'error');
    } finally {
      setIsLoading(false); // Finalizar animación de carga
    }
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
      console.log(data);
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
      const params = new URLSearchParams({
        query: rawQuery,
        limit: 8,
        country: 'AR', // Puedes ajustar o permitir que el usuario seleccione el país
        // Añade otros parámetros según sea necesario
      });

      // Opcional: Añadir más parámetros desde el estado o props

      const response = await fetch(`${config.API_URL}/dominios/sugerir?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  // Función para manejar la selección de un dominio sugerido
  const handleSelectDomain = (domain) => {
    // Redirigir a una página de compra o mostrar un modal con más detalles
    navigate(`/dominios/comprar?domain=${encodeURIComponent(domain)}`);
  };

  return (
    <div className="dominios-busqueda-page">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          <FaArrowLeft /> Volver
        </button>
        <h2>Resultados de Búsqueda</h2>
      </div>

      <p>
        Buscaste: <strong>{query}</strong>
      </p>

      {/* Mostrar animación de carga mientras isLoading es true */}
      {isLoading && (
        <div className="loading-animation">
          <Player
            autoplay
            loop
            src="/assets/videos/animacionCarga.json" // Ruta relativa a la carpeta public
            style={{ height: '300px', width: '300px' }}
          >
          </Player>
        </div>
      )}

      {/* Mostrar resultado de disponibilidad (si query tenía punto) */}
      {!isLoading && availabilityResult && (
        <div className="domain-check-result">
          <h3>Disponibilidad</h3>
          <p>
            <strong>Dominio:</strong> {availabilityResult.domain}
          </p>
          {typeof availabilityResult.price === 'number' && (
            <p>
              <strong>Precio:</strong> {availabilityResult.price} {availabilityResult.currency || 'USD'}
            </p>
          )}
          {availabilityResult.available && (
            <button
              onClick={() => handleSelectDomain(availabilityResult.domain)}
              className="select-button"
              aria-label={`Seleccionar dominio ${availabilityResult.domain}`}
            >
              Seleccionar
            </button>
          )}
        </div>
      )}

      {/* Mostrar sugerencias siempre si no está cargando */}
      {!isLoading && suggestions.length > 0 && (
        <div className="domain-suggestions">
          <h3>Otras opciones similares</h3>
          <table>
            <thead>
              <tr>
                <th>Dominio</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((sug, idx) => (
                <tr key={idx}>
                  <td>{sug.domain}</td>
                  <td>{sug.price ? `${sug.price} ${sug.currency}` : 'N/A'}</td>
                  <td>
                    <button onClick={() => handleSelectDomain(sug.domain)}>Seleccionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Si no hay disponibilidadResult y no hay suggestions, puede ser que no se encontró nada */}
      {!isLoading && !availabilityResult && suggestions.length === 0 && (
        <p>No se encontraron datos para la búsqueda.</p>
      )}
    </div>
  );
};

export default DominiosBusquedaPage;