// src/components/ContactoModal.js

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa'; 
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import config from '../config/config.js';

const ContactoModal = ({ onClose, usuario }) => {
  const [selectedContactType, setSelectedContactType] = useState('Admin'); 
  const [formData, setFormData] = useState({
    tipo_contacto: 'Admin',
    contactInfo: {
      nombre: usuario?.nombre || '', 
      nameMiddle: '',
      nameLast: usuario?.apellido || '',
      email: usuario?.email || '',
      phone: '',
      fax: '', 
      jobTitle: '',
      organization: '',
      addressMailing: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
    },
    billingInfo: { // Añadido para campos de Billing
      taxId: '',
      billingAddress: '',
    },
    consent: {
      agreedAt: '', // Se establecerá a la fecha actual
      agreedBy: '', // Se establecerá al nombre completo del usuario
      agreementKeys: [],
    },
    saveForFuture: false, 
  });

  const [errors, setErrors] = useState({});

  // Manejar cierre del modal con la tecla Esc
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Establecer consentimiento al cargar el modal
  useEffect(() => {
    if (usuario) {
      const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const fullName = [usuario.nombre, usuario.apellido].filter(Boolean).join(' '); // Concatenar nombre y apellido
      setFormData((prev) => ({
        ...prev,
        consent: {
          ...prev.consent,
          agreedAt: currentDate,
          agreedBy: fullName,
        },
      }));
    }
  }, [usuario]);

  // **Verificar que 'usuario' esté definido después de los Hooks**
  if (!usuario) {
    return null;
  }

  // Manejar cambios en los campos de texto y selección de tipo de contacto
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Manejar el cambio del tipo de contacto
    if (name === 'tipo_contacto') {
      setSelectedContactType(value);
      setFormData((prev) => ({
        ...prev,
        tipo_contacto: value,
        contactInfo: {
          nombre: usuario.nombre || '',
          nameMiddle: '',
          nameLast: usuario.apellido || '',
          email: usuario.email || '',
          phone: '',
          fax: '',
          jobTitle: '',
          organization: '',
          addressMailing: {
            address1: '',
            address2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
          },
        },
        billingInfo: { // Resetear campos de Billing si cambia el tipo de contacto
          taxId: '',
          billingAddress: '',
        },
      }));
      setErrors({});
      return;
    }

    // Manejar el checkbox para guardar datos
    if (type === 'checkbox' && name === 'saveForFuture') {
      setFormData((prev) => ({
        ...prev,
        saveForFuture: checked,
      }));
      return;
    }

    // Manejar cambios en los campos de contacto
    if (name.startsWith('contactInfo.addressMailing.')) {
      const addressField = name.split('.')[2];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          addressMailing: {
            ...prev.contactInfo.addressMailing,
            [addressField]: value,
          },
        },
      }));
    } else if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
    } else if (name.startsWith('billingInfo.')) { 
      const billingField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        billingInfo: {
          ...prev.billingInfo,
          [billingField]: value,
        },
      }));
    } else if (name.startsWith('consent.')) {
      const consentField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        consent: {
          ...prev.consent,
          [consentField]: value,
        },
      }));
    }
  };

  // Manejar cambios en los checkboxes de consentimiento
  const handleAgreementChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const agreementKeys = checked
        ? [...prev.consent.agreementKeys, value]
        : prev.consent.agreementKeys.filter((key) => key !== value);
      return {
        ...prev,
        consent: {
          ...prev.consent,
          agreementKeys,
        },
      };
    });
  };

  // Validar el formulario
  const validate = () => {
    const newErrors = {};

    const contact = formData.contactInfo;

    // Validar campos de contacto
    if (!contact.nombre.trim()) {
      newErrors.nombre = 'Este campo es obligatorio.';
    }
    if (!contact.nameLast.trim()) {
      newErrors.nameLast = 'Este campo es obligatorio.';
    }
    if (!contact.email.trim()) {
      newErrors.email = 'Este campo es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(contact.email)) {
      newErrors.email = 'Debe ser un correo electrónico válido.';
    }
    if (!contact.jobTitle.trim()) {
      newErrors.jobTitle = 'Este campo es obligatorio.';
    }
    if (!contact.organization.trim()) {
      newErrors.organization = 'Este campo es obligatorio.';
    }
    if (!contact.phone.trim()) {
      newErrors.phone = 'Este campo es obligatorio.';
    }
    if (!contact.addressMailing.address1.trim()) {
      newErrors.address1 = 'Este campo es obligatorio.';
    }
    if (!contact.addressMailing.city.trim()) {
      newErrors.city = 'Este campo es obligatorio.';
    }
    if (!contact.addressMailing.state.trim()) {
      newErrors.state = 'Este campo es obligatorio.';
    }
    if (!contact.addressMailing.postalCode.trim()) {
      newErrors.postalCode = 'Este campo es obligatorio.';
    }
    if (!contact.addressMailing.country.trim()) {
      newErrors.country = 'Este campo es obligatorio.';
    }

    // Validar campos adicionales según tipo de contacto
    if (selectedContactType === 'Billing') {
      const billing = formData.billingInfo;
      if (!billing.taxId.trim()) {
        newErrors.taxId = 'El ID Fiscal es obligatorio.';
      }
      if (!billing.billingAddress.trim()) {
        newErrors.billingAddress = 'La Dirección de Facturación es obligatoria.';
      }
    }

    // Validar consentimiento
    // consent.agreedAt y consent.agreedBy ya están prellenados, pero validar que no estén vacíos
    if (!formData.consent.agreedAt) {
      newErrors.agreedAt = 'La fecha de consentimiento es obligatoria.';
    }
    if (!formData.consent.agreedBy.trim()) {
      newErrors.agreedBy = 'El nombre que consiente es obligatorio.';
    }
    if (!formData.consent.agreementKeys.length) {
      newErrors.agreementKeys = 'Debe aceptar al menos un acuerdo.';
    }

    setErrors(newErrors);

    // Retornar verdadero si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        // Preparar el payload para la API de compra de dominio
        const payload = {
          consent: {
            agreedAt: formData.consent.agreedAt,
            agreedBy: formData.consent.agreedBy,
            agreementKeys: formData.consent.agreementKeys,
          },
          [`contact${formData.tipo_contacto}`]: formData.contactInfo,
          domain: 'example.com', // Reemplazar con el dominio real
          nameServers: ['ns1.example.com', 'ns2.example.com'], // Reemplazar según corresponda
          period: 1, // Por ejemplo, 1 año
          privacy: false, 
          renewAuto: true, 
        };

        // Realizar la solicitud a la API para comprar el dominio
        const response = await fetch(`${config.API_URL}/dominios/registrar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'X-Shopper-Id': 'shopper-id-valor', // Eliminado
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire('Éxito', `El dominio ${payload.domain} ha sido registrado exitosamente.`, 'success');

          // Si el usuario optó por guardar los datos
          if (formData.saveForFuture) {
            // Preparar los datos para UsuarioContacto
            const contactoToSave = {
              tipo_contacto: formData.tipo_contacto,
              nombre: formData.contactInfo.nombre, // Cambiado de nameFirst a nombre
              nameMiddle: formData.contactInfo.nameMiddle,
              nameLast: formData.contactInfo.nameLast,
              email: formData.contactInfo.email,
              phone: formData.contactInfo.phone,
              fax: '', // Como no se usa fax, lo enviamos como cadena vacía
              jobTitle: formData.contactInfo.jobTitle,
              organization: formData.contactInfo.organization,
              addressMailing: formData.contactInfo.addressMailing,
            };

            // Realizar la solicitud al backend para guardar el contacto
            const saveResponse = await fetch(`${process.env.REACT_APP_API_URL}/user-contact`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include', // Si usas cookies para autenticación
              body: JSON.stringify({
                contacto: contactoToSave,
              }),
            });

            if (saveResponse.ok) {
              Swal.fire('Éxito', 'Tus datos de contacto han sido guardados para futuras compras.', 'success');
            } else {
              Swal.fire('Advertencia', 'La compra fue exitosa, pero no se pudieron guardar tus datos de contacto.', 'warning');
            }
          }

          // Cerrar el modal
          onClose();
        } else {
          Swal.fire('Error', data.message || 'No se pudo registrar el dominio', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error interno del servidor', 'error');
      }
    } else {
      Swal.fire('Error', 'Por favor, corrige los errores en el formulario.', 'error');
    }
  };

  // Obtener el nodo modal-root
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error("No se encontró el nodo 'modal-root' en el DOM.");
    return null;
  }

  // Función para renderizar campos dinámicamente según el tipo de contacto
  const renderContactFields = () => {
    return (
      <>
        {/* Agrupar campos en dos columnas */}
        <div className="form-group two-column">
          <div className="form-group-item">
            <label htmlFor="contactInfo.nombre">Nombre</label>
            <input
              type="text"
              id="contactInfo.nombre"
              name="contactInfo.nombre"
              value={formData.contactInfo.nombre}
              onChange={handleChange}
              placeholder="Juan"
              required
            />
            {errors.nombre && <span className="error">{errors.nombre}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.nameMiddle">Segundo Nombre</label>
            <input
              type="text"
              id="contactInfo.nameMiddle"
              name="contactInfo.nameMiddle"
              value={formData.contactInfo.nameMiddle}
              onChange={handleChange}
              placeholder="Carlos"
            />
            {errors.nameMiddle && <span className="error">{errors.nameMiddle}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.nameLast">Apellido</label>
            <input
              type="text"
              id="contactInfo.nameLast"
              name="contactInfo.nameLast"
              value={formData.contactInfo.nameLast}
              onChange={handleChange}
              placeholder="Pérez"
              required
            />
            {errors.nameLast && <span className="error">{errors.nameLast}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.email">Correo Electrónico</label>
            <input
              type="email"
              id="contactInfo.email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.phone">Teléfono</label>
            <input
              type="text"
              id="contactInfo.phone"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8901"
              required
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          {/* Removed Fax field */}

          <div className="form-group-item">
            <label htmlFor="contactInfo.jobTitle">Título Profesional o Cargo</label>
            <input
              type="text"
              id="contactInfo.jobTitle"
              name="contactInfo.jobTitle"
              value={formData.contactInfo.jobTitle}
              onChange={handleChange}
              placeholder="Gerente de TI"
              required
            />
            {errors.jobTitle && <span className="error">{errors.jobTitle}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.organization">Organización</label>
            <input
              type="text"
              id="contactInfo.organization"
              name="contactInfo.organization"
              value={formData.contactInfo.organization}
              onChange={handleChange}
              placeholder="Empresa XYZ"
              required
            />
            {errors.organization && <span className="error">{errors.organization}</span>}
          </div>
        </div>

        {/* Dirección de Contacto */}
        <h5>Dirección de Contacto</h5>
        <div className="form-group two-column">
          <div className="form-group-item">
            <label htmlFor="contactInfo.addressMailing.address1">Dirección 1</label>
            <input
              type="text"
              id="contactInfo.addressMailing.address1"
              name="contactInfo.addressMailing.address1"
              value={formData.contactInfo.addressMailing.address1}
              onChange={handleChange}
              placeholder="Calle Principal 123"
              required
            />
            {errors.address1 && <span className="error">{errors.address1}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.addressMailing.address2">Dirección 2</label>
            <input
              type="text"
              id="contactInfo.addressMailing.address2"
              name="contactInfo.addressMailing.address2"
              value={formData.contactInfo.addressMailing.address2}
              onChange={handleChange}
              placeholder="Suite 456"
            />
            {errors.address2 && <span className="error">{errors.address2}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.addressMailing.city">Ciudad</label>
            <input
              type="text"
              id="contactInfo.addressMailing.city"
              name="contactInfo.addressMailing.city"
              value={formData.contactInfo.addressMailing.city}
              onChange={handleChange}
              placeholder="Ciudad Ejemplo"
              required
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.addressMailing.state">Estado/Provincia</label>
            <input
              type="text"
              id="contactInfo.addressMailing.state"
              name="contactInfo.addressMailing.state"
              value={formData.contactInfo.addressMailing.state}
              onChange={handleChange}
              placeholder="Estado Ejemplo"
              required
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.addressMailing.postalCode">Código Postal</label>
            <input
              type="text"
              id="contactInfo.addressMailing.postalCode"
              name="contactInfo.addressMailing.postalCode"
              value={formData.contactInfo.addressMailing.postalCode}
              onChange={handleChange}
              placeholder="12345"
              required
            />
            {errors.postalCode && <span className="error">{errors.postalCode}</span>}
          </div>

          <div className="form-group-item">
            <label htmlFor="contactInfo.addressMailing.country">País</label>
            <select
              id="contactInfo.addressMailing.country"
              name="contactInfo.addressMailing.country"
              value={formData.contactInfo.addressMailing.country}
              onChange={handleChange}
              required
            >
              <option value="US">Estados Unidos</option>
              <option value="MX">México</option>
              <option value="ES">España</option>
              {/* Agrega más opciones según sea necesario */}
            </select>
            {errors.country && <span className="error">{errors.country}</span>}
          </div>
        </div>
      </>
    );
  };

  // Condicionalmente renderizar campos adicionales según el tipo de contacto
  const renderAdditionalFields = () => {
    switch (selectedContactType) {
      case 'Billing':
        return (
          <>
            <h5>Información de Facturación</h5>
            <div className="form-group two-column">
              <div className="form-group-item">
                <label htmlFor="billingInfo.taxId">ID Fiscal</label>
                <input
                  type="text"
                  id="billingInfo.taxId"
                  name="billingInfo.taxId"
                  value={formData.billingInfo?.taxId || ''}
                  onChange={handleChange}
                  placeholder="123-4567890"
                />
                {errors.taxId && <span className="error">{errors.taxId}</span>}
              </div>
              <div className="form-group-item">
                <label htmlFor="billingInfo.billingAddress">Dirección de Facturación</label>
                <input
                  type="text"
                  id="billingInfo.billingAddress"
                  name="billingInfo.billingAddress"
                  value={formData.billingInfo?.billingAddress || ''}
                  onChange={handleChange}
                  placeholder="Calle Facturación 789"
                />
                {errors.billingAddress && <span className="error">{errors.billingAddress}</span>}
              </div>
            </div>
          </>
        );
      // Agrega más casos según los tipos de contacto que manejes
      default:
        return null;
    }
  };

  // Renderizar el modal usando React Portals
  return ReactDOM.createPortal(
    <div className="contacto-modal-overlay" onClick={onClose}>
      <div className="contacto-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Cerrar Modal">
          <FaTimes />
        </button>
        <h3>Información de Contacto</h3>
        <form onSubmit={handleSubmit}>
          {/* Selección del Tipo de Contacto */}
          <div className="form-group">
            <label htmlFor="tipo_contacto">Tipo de Contacto</label>
            <select
              id="tipo_contacto"
              name="tipo_contacto"
              value={formData.tipo_contacto}
              onChange={handleChange}
              required
            >
              <option value="Admin">Administrativo</option>
              <option value="Billing">Facturación</option>
              <option value="Registrant">Registrante</option>
              <option value="Tech">Técnico</option>
            </select>
          </div>

          {/* Campos Dinámicos Según Tipo de Contacto */}
          {renderContactFields()}

          {/* Campos Adicionales Según Tipo de Contacto */}
          {renderAdditionalFields()}

          {/* Consentimiento */}
          <div className="form-group">
            <h4>Consentimiento</h4>
            {/* Consentimiento: Fecha y Nombre ya están prellenados, mostrar datos */}
            <div className="consent-section">
              <p><strong>Fecha de Consentimiento:</strong> {formData.consent.agreedAt}</p>
              <p><strong>Nombre que Consiente:</strong> {formData.consent.agreedBy}</p>
            </div>

            <label>Acuerdos</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="consent.agreementKeys"
                  value="I agree to the Terms of Service."
                  onChange={handleAgreementChange}
                />
                Acepto los Términos del Servicio.
              </label>
              <label>
                <input
                  type="checkbox"
                  name="consent.agreementKeys"
                  value="I agree to the Privacy Policy."
                  onChange={handleAgreementChange}
                />
                Acepto la Política de Privacidad.
              </label>
            </div>
            {errors.agreementKeys && <span className="error">{errors.agreementKeys}</span>}
          </div>

          {/* Checkbox para guardar datos */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="saveForFuture"
                checked={formData.saveForFuture}
                onChange={handleChange}
              />
              Guardar mis datos para futuras compras
            </label>
          </div>

          {/* Botón de Envío */}
          <button type="submit" className="button">
            Confirmar
          </button>
        </form>
      </div>
    </div>,
    modalRoot 
  );
};

// Definir PropTypes para Validación de Props
ContactoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  usuario: PropTypes.shape({
    nombre: PropTypes.string,
    apellido: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
};

export default ContactoModal;
