// src/components/CrearServicioModal.js

import React, { useContext, useState } from 'react';
import Swal from 'sweetalert2';
import config from '../config/config.js';
import { AuthContext } from '../contexts/AuthContext.js';

const CrearServicioModal = ({ onClose, onCrear }) => {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('Activo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);

  // Verificar si el usuario puede crear servicios
  const canCreateService = ['admin', 'internal'].includes(user.rol); // Ajusta según tu modelo de roles

  if (!canCreateService) {
    return null; // No renderizar nada si no puede crear servicios
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire('Error', 'El nombre del servicio es obligatorio.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${config.API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre: nombre.trim(), estado, id_usuario: user.id_usuario }),
      });
      const data = await response.json();

      if (response.ok) {
        onCrear(data.data); // Pasar el nuevo servicio al padre
      } else {
        Swal.fire('Error', data.message || 'No se pudo crear el servicio.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error interno del servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crear-servicio-modal">
      <div className="modal-content">
        <h3>Crear Nuevo Servicio</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Servicio</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              {/* Añade más estados según necesidad */}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearServicioModal;
