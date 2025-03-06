// src/pages/DominiosBusquedaPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Player } from '@lottiefiles/react-lottie-player';
import config from '../config/config.js';
import Swal from 'sweetalert2';
import { AuthContext } from '../contexts/AuthContext.js';
import { CartContext } from '../contexts/CartContext.js';

const DominiosBusquedaPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, fetchCart } = useContext(CartContext);

  useEffect(() => {
    if (query.trim()) {
      fetchDomainData(query.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchDomainData = async (rawQuery) => {
    setIsLoading(true);
    try {
      // Si el query incluye punto, intenta chequear disponibilidad
      if (rawQuery.includes('.')) {
        await checkAvailability(rawQuery);
      }
      // Siempre se hacen las sugerencias
      await suggestDomains(rawQuery);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al obtener datos del dominio', 'error');
    } finally {
      setIsLoading(false);
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
        country: 'AR',
      });
      const response = await fetch(`${config.API_URL}/dominios/sugerir?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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

  // Función para agregar un dominio al carrito
  const addDomainToCart = async (domainSuggestion) => {
    // Verificamos que exista un carrito activo
    if (!cart || !cart.id_carrito) {
      Swal.fire('Error', 'No se encontró un carrito activo. Por favor, intenta nuevamente.', 'error');
      return;
    }

    // Construir el objeto del ítem para el dominio
    const itemData = {
      id_carrito: cart.id_carrito,
      tipoProducto: 'DOMINIO',
      productoId: domainSuggestion.domain, // Usamos el nombre del dominio
      descripcion: domainSuggestion.domain,
      cantidad: 1,
      precioUnitario: domainSuggestion.price
        ? domainSuggestion.price.toFixed(2)
        : '0.00',
      metaDatos: {
        domain: domainSuggestion.domain,
        price: domainSuggestion.price,
        currency: domainSuggestion.currency || 'USD',
      },
    };

    try {
      const response = await fetch(`${config.API_URL}/cart-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire('Agregado', `El dominio ${domainSuggestion.domain} fue agregado al carrito.`, 'success');
        await fetchCart();
        navigate('/carrito');
      } else {
        Swal.fire('Error', result.message || 'No se pudo agregar el dominio al carrito.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
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

      <p>
        Buscaste: <strong>{query}</strong>
      </p>

      {isLoading && (
        <div className="loading-animation">
          <Player
            autoplay
            loop
            src="/assets/videos/animacionCarga.json"
            style={{ height: '300px', width: '300px' }}
          />
        </div>
      )}

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
              onClick={() => addDomainToCart(availabilityResult)}
              className="select-button"
              aria-label={`Seleccionar dominio ${availabilityResult.domain}`}
            >
              Seleccionar
            </button>
          )}
        </div>
      )}

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
                    <button onClick={() => addDomainToCart(sug)}>Seleccionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !availabilityResult && suggestions.length === 0 && (
        <p>No se encontraron datos para la búsqueda.</p>
      )}
    </div>
  );
};

export default DominiosBusquedaPage;
