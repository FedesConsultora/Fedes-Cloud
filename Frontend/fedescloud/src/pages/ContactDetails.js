// src/pages/ContactDetails.js
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';

const ContactDetails = () => {
  const { subRole, accessAsParent  } = useContext(AuthContext);
  const [contactId, setContactId] = useState(null);
  const [contactData, setContactData] = useState({
    tipo_contacto: 'No configurado',
    phone: '',
    jobTitle: '',
    fax: '',
    organization: ''
  });

  // Definimos la variable que determina si se pueden editar los campos.
  
    
  const canEdit = !accessAsParent || (subRole === 'Registrante' || subRole === 'Administrador');
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch(`${config.API_URL}/user-contact`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
          }
        });
        if (!response.ok) {
          Swal.fire('Error', 'No se pudo obtener la información de contacto', 'error');
          return;
        }
        const result = await response.json();
        if (result && result.success && result.data) {
          const contact = result.data;
          setContactId(contact.id_contacto);
          setContactData({
            tipo_contacto: contact.tipo_contacto || 'No configurado',
            phone: contact.phone || '',
            jobTitle: contact.jobTitle || '',
            fax: contact.fax || '',
            organization: contact.organization || ''
          });
        }
      } catch (error) {
        console.error('Error al obtener datos de contacto:', error);
      }
    };

    fetchContactData();
  }, []);

  // Actualiza el estado conforme se modifiquen los inputs
  const handleChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  // Al guardar, se construye el payload acorde al modelo actualizado y se realiza la llamada
  const handleSave = async () => {
    if (!canEdit) {
      Swal.fire('Atención', 'No tienes permisos para editar los datos de contacto', 'info');
      return;
    }
    try {
      const payload = {
        contacto: {
          tipo_contacto: contactData.tipo_contacto,
          phone: contactData.phone,
          jobTitle: contactData.jobTitle,
          fax: contactData.fax,
          organization: contactData.organization,
        },
      };

      let url = `${config.API_URL}/user-contact`;
      let method = 'POST';

      // Si ya existe un registro, se actualiza mediante PUT
      if (contactId) {
        url = `${config.API_URL}/user-contact/${contactId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Datos de contacto guardados correctamente', 'success');
      } else {
        Swal.fire('Error', 'No se pudo guardar los datos de contacto', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al guardar los datos de contacto', 'error');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h3>Datos de contacto</h3>
        {/* Si no se pueden editar, se muestra un mensaje informativo */}
        {!canEdit && (
          <div className="alert-message">
            Solo el usuario con subrol Registrante o Administrador puede editar los datos de contacto.
          </div>
        )}
        <div className="contact-info">
          <form>
            <div className="form-group">
              <label>Tipo de Contacto:</label>
              <select
                name="tipo_contacto"
                value={contactData.tipo_contacto}
                onChange={handleChange}
                disabled={!canEdit}
              >
                <option value="No configurado">No configurado</option>
                <option value="Administrador">Administrador</option>
                <option value="Facturación">Facturación</option>
                <option value="Registrante">Registrante</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                name="phone"
                value={contactData.phone}
                onChange={handleChange}
                placeholder="Teléfono"
                disabled={!canEdit}
              />
            </div>
            <div className="form-group">
              <label>Cargo:</label>
              <input
                type="text"
                name="jobTitle"
                value={contactData.jobTitle}
                onChange={handleChange}
                placeholder="Cargo o título laboral"
                disabled={!canEdit}
              />
            </div>
            <div className="form-group">
              <label>Fax (opcional):</label>
              <input
                type="text"
                name="fax"
                value={contactData.fax}
                onChange={handleChange}
                placeholder="Fax"
                disabled={!canEdit}
              />
            </div>
            <div className="form-group">
              <label>Organización:</label>
              <input
                type="text"
                name="organization"
                value={contactData.organization}
                onChange={handleChange}
                placeholder="Nombre de la organización"
                disabled={!canEdit}
              />
            </div>
            {/* Solo muestra el botón de guardar si se permite editar */}
            {canEdit && (
              <button type="button" className="button" onClick={handleSave}>
                Guardar
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
