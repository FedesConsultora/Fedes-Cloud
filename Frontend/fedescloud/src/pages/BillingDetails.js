// src/pages/BillingDetails.js
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const BillingDetails = () => {
  const [billingData, setBillingData] = useState({
    razonSocial: '',
    domicilio: '',
    ciudad: '',
    provincia: 'Buenos Aires',
    pais: '',
    condicionIVA: '',
  });

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/user-billing`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`
          }
        });
        if (!response.ok) {
          Swal.fire('Error', 'No se pudieron obtener los datos de facturación', 'error');
          return;
        }
        const result = await response.json();
        // Se extrae el objeto real de datos de facturación
        setBillingData(result.data || {
          razonSocial: '',
          domicilio: '',
          ciudad: '',
          provincia: 'Buenos Aires',
          pais: '',
          condicionIVA: ''
        });
      } catch (error) {
        console.error('Error al obtener datos de facturación:', error);
        Swal.fire('Error', 'Ocurrió un error al obtener datos de facturación', 'error');
      }
    };

    fetchBillingData();
  }, []);

  const handleChange = (e) => {
    setBillingData({ ...billingData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${config.API_URL}/user-billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ facturacion: billingData }),
      });
      if (response.ok) {
        Swal.fire('Éxito', 'Datos de facturación actualizados', 'success');
      } else {
        Swal.fire('Error', 'No se pudo actualizar los datos de facturación', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al guardar los datos', 'error');
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-container">
        <h3>Datos de facturación</h3>
        <div className="billing-info">
          <form>
            <div className="form-group">
              <label>Razón Social:</label>
              <input
                type="text"
                name="razonSocial"
                value={billingData.razonSocial}
                onChange={handleChange}
                placeholder="Razón Social"
              />
            </div>
            <div className="form-group">
              <label>Domicilio:</label>
              <input
                type="text"
                name="domicilio"
                value={billingData.domicilio}
                onChange={handleChange}
                placeholder="Domicilio"
              />
            </div>
            <div className="form-group">
              <label>Ciudad:</label>
              <input
                type="text"
                name="ciudad"
                value={billingData.ciudad}
                onChange={handleChange}
                placeholder="Ciudad"
              />
            </div>
            <div className="form-group">
              <label>Provincia:</label>
              <select name="provincia" value={billingData.provincia} onChange={handleChange}>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="CABA">CABA</option>
                {/* Agrega más provincias según sea necesario */}
              </select>
            </div>
            <div className="form-group">
              <label>País:</label>
              <select name="pais" value={billingData.pais} onChange={handleChange}>
                <option value="">Elige un país</option>
                <option value="Argentina">Argentina</option>
                {/* Mapea la lista que necesites */}
              </select>
            </div>
            <div className="form-group">
              <label>Condición IVA:</label>
              <select name="condicionIVA" value={billingData.condicionIVA} onChange={handleChange}>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="IVA responsable inscripto">IVA responsable inscripto</option>
                <option value="Sujeto no categorizado">Sujeto no categorizado</option>
                <option value="Exento">Exento</option>
                <option value="Monotributo">Monotributo</option>
                <option value="IVA no responsable">IVA no responsable</option>
              </select>
            </div>
            <button type="button" className="button" onClick={handleSave}>
              Guardar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;