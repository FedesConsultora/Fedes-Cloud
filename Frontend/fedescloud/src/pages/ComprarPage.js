// src/pages/ComprarPage.js

import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import config from '../config/config.js';
import Swal from 'sweetalert2';
import { AuthContext } from '../contexts/AuthContext.js';
import CrearServicioModal from '../components/CrearServicioModal.js'; // Componente para crear Servicio
import ContactoModal from '../components/ContactoModal.js'; // Nuevo componente para contacto

const ComprarPage = () => {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain') || '';
  const [domainAvailability, setDomainAvailability] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCrearServicioModalOpen, setIsCrearServicioModalOpen] = useState(false);
  const [isContactoModalOpen, setIsContactoModalOpen] = useState(false); // Nuevo estado para Contacto
  const [contactInfo, setContactInfo] = useState(null); // Información de contacto
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  console.log(user)
  useEffect(() => {
    if (domain.trim()) {
      checkDomainAvailability(domain.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  const checkDomainAvailability = async (dom) => {
    try {
      const response = await fetch(`${config.API_URL}/dominios/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ domain: dom }),
      });
      const data = await response.json();
      if (response.ok) {
        setDomainAvailability(data.data || {});
      } else {
        Swal.fire('Error', data.message || 'No se pudo verificar la disponibilidad del dominio', 'error');
        setDomainAvailability(null);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error interno del servidor', 'error');
      setDomainAvailability(null);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!domain) {
      Swal.fire('Error', 'No se especificó ningún dominio para comprar.', 'error');
      return;
    }

    if (!contactInfo) {
      Swal.fire('Error', 'Debe proporcionar la información de contacto.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${config.API_URL}/dominios/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          domain: domain,
          period: 1,
          privacy: true, // Puedes permitir que el usuario seleccione este valor
          renewAuto: true,
          ...contactInfo, // Incluir la información de contacto y consentimiento
        }),
      });
      console.log('response: ', response);
      const data = await response.json();
      if (response.ok) {
        Swal.fire('Éxito', `El dominio ${domain} ha sido registrado exitosamente.`, 'success');
        // Redirigir a la página de confirmación
        navigate(`/confirmacion-compra?domain=${encodeURIComponent(domain)}`);
      } else {
        Swal.fire('Error', data.message || 'No se pudo registrar el dominio', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error interno del servidor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrearServicio = async (nuevoServicio) => {
    // Actualizar la lista de servicios después de crear uno nuevo
    setServicios([...servicios, nuevoServicio]);
    setSelectedServicio(nuevoServicio.id_servicio);
    setIsCrearServicioModalOpen(false);
    Swal.fire('Éxito', 'Servicio creado exitosamente.', 'success');
  };

  const handleContactoSubmit = (contactData) => {
    setContactInfo(contactData);
    setIsContactoModalOpen(false);
    Swal.fire('Éxito', 'Información de contacto proporcionada.', 'success');
  };

  // Determinar si el usuario puede crear servicios
  const canCreateService = ['admin', 'internal'].includes(user.rol); // Ajusta según tu modelo de roles

  // Buscar servicios existentes del usuario
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState('');

  useEffect(() => {
    fetchServicios(); // Obtener servicios al montar el componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  const fetchServicios = async () => {
    try {
      const response = await fetch(`${config.API_URL}/services`, { // Corregido a /servicios
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setServicios(data.data || []);
        if (data.data.length > 0) {
          setSelectedServicio(data.data[0].id_servicio); // Seleccionar el primer servicio por defecto
        }
      } else {
        Swal.fire('Error', data.message || 'No se pudo obtener servicios', 'error');
        setServicios([]);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error interno del servidor', 'error');
    }
  };

  return (
    <div className="comprar-page">
      <div className="header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Volver">
          <FaArrowLeft /> Volver
        </button>
        <h2>Comprar Dominio</h2>
      </div>

      <p>Estás comprando: <strong>{domain}</strong></p>

      {domainAvailability ? (
        <div className="domain-info">
          <h3>Detalles del Dominio</h3>
          <p><strong>Dominio:</strong> {domainAvailability.domain}</p>
          <p><strong>Disponible:</strong> {domainAvailability.available ? 'Sí' : 'No'}</p>
          {domainAvailability.available && (
            <p><strong>Precio:</strong> {domainAvailability.price} {domainAvailability.currency || 'USD'}</p>
          )}
          {/* Puedes añadir más detalles según la información obtenida */}
        </div>
      ) : (
        <p>Verificando disponibilidad del dominio...</p>
      )}

      {servicios.length > 0 ? (
        <div className="servicio-selection">
          <h3>Servicio Asignado</h3>
          <p>El dominio será asignado al servicio: <strong>{servicios[0].nombre}</strong></p>
        </div>
      ) : (
        <div className="no-servicios">
          <p>No tienes servicios disponibles para asociar el dominio.</p>
          {canCreateService ? (
            <button
              className="crear-servicio-button"
              onClick={() => setIsCrearServicioModalOpen(true)}
            >
              Crear Nuevo Servicio
            </button>
          ) : (
            <p>Contacta a un administrador para asignar un servicio a tu dominio.</p>
          )}
        </div>
      )}

      {domainAvailability && domainAvailability.available && (
        <button
          className="purchase-button"
          onClick={() => setIsContactoModalOpen(true)} // Abrir modal de contacto
          disabled={isProcessing}
        >
          {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
        </button>
      )}

      {(!domainAvailability && (
        <p>No se pudo verificar la disponibilidad del dominio.</p>
      ))}

      {/* Modal para Crear Servicio (solo para roles permitidos) */}
      {isCrearServicioModalOpen && canCreateService && (
        <CrearServicioModal
          onClose={() => setIsCrearServicioModalOpen(false)}
          onCrear={handleCrearServicio}
        />
      )}

      {/* Modal para Información de Contacto */}
      {isContactoModalOpen && (
        <ContactoModal
          onClose={() => setIsContactoModalOpen(false)}
          onSubmit={handleContactoSubmit}
          usuario={user} 
        />
      )}
    </div>
  );
};

export default ComprarPage;
