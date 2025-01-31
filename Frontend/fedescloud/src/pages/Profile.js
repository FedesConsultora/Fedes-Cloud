import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  // Estado local para "nombre" y "apellido", y el avatar actual
  const [formData, setFormData] = useState({
    nombre: user?.nombre ?? '',
    apellido: user?.apellido ?? '',
    avatar: user?.avatar ?? null,
  });

  // Estado para saber si se está editando "nombre" o "apellido".
  // (Para el avatar, usaremos el input oculto con un click programático.)
  const [editingFields, setEditingFields] = useState({
    nombre: false,
    apellido: false,
  });

  // Referencia al <input type="file"> oculto.
  const fileInputRef = useRef(null);

  if (!user) {
    return <div>No se encontraron datos del usuario.</div>;
  }

  // Maneja cambios en los inputs (nombre, apellido).
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Abre el selector de archivos para el avatar (click programático).
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Lógica al seleccionar una imagen en el input oculto.
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append('avatar', file);

    try {
      // Envía la imagen al backend
      const response = await fetch(`${config.API_URL}/auth/upload-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formDataImage,
      });
      const result = await response.json();
      console.log('resultado', result);
      if (response.ok) {
        // Actualiza el estado local con la nueva URL
        setFormData({ ...formData, avatar: result.url });
        // Además, actualiza el perfil en la BD (para reflejar la nueva imagen)
        await saveField('avatar', result.url);
      } else {
        Swal.fire('Error', result.message || 'No se pudo subir el avatar', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  // Alterna el modo edición de un campo (nombre o apellido).
  const toggleEditField = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Llama a /auth/update-profile para actualizar el campo en la BD.
  const saveField = async (field, value = formData[field]) => {
    try {
      const response = await fetch(`${config.API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value }),
      });
      const result = await response.json();

      if (response.ok) {
        updateUser({ ...user, [field]: value });
        Swal.fire('Éxito', 'Perfil actualizado exitosamente', 'success');
        // Cierra el modo edición
        if (field !== 'avatar') {
          setEditingFields({ ...editingFields, [field]: false });
        }
      } else {
        Swal.fire('Error', result.message || 'No se pudo actualizar el perfil', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  // Guarda cambios de nombre o apellido
  const handleSaveClick = (field) => {
    saveField(field);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Perfil del Usuario</h2>
        <div className="profile-info">
          
          {/* Campo Avatar */}
          <div className="profile-field avatar-field">
            <div className="avatar-wrapper">
              {/* Imagen de avatar */}
              <img
                src={formData.avatar ?? `${process.env.PUBLIC_URL}/assets/icons/user-placeholder2.png`}
                alt="User Avatar"
                className="user-avatar"
              />

              {/* Overlay con lápiz para editar */}
              <div className="avatar-overlay" onClick={handleAvatarClick}>
                <div className="avatar-overlay-content">
                  <img
                    src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`}
                    alt="Editar"
                  />
                  <span>Editar</span>
                </div>
              </div>

              {/* Input oculto: se hace click en él programáticamente */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Campo Nombre */}
          <div className="profile-field">
            <label>Nombre:</label>
            {editingFields.nombre ? (
              <div className="input-group">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre || ''}
                  onChange={handleChange}
                />
                <button className="save-btn" onClick={() => handleSaveClick('nombre')}>
                  Guardar
                </button>
                <button className="cancel-btn" onClick={() => toggleEditField('nombre')}>
                  Cancelar
                </button>
              </div>
            ) : (
              <span>{formData.nombre ?? ''}</span>
            )}
            {!editingFields.nombre && (
              <button className="edit-btn" onClick={() => toggleEditField('nombre')}>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`}
                  alt="Editar"
                />
              </button>
            )}
          </div>

          {/* Campo Apellido */}
          <div className="profile-field">
            <label>Apellido:</label>
            {editingFields.apellido ? (
              <div className="input-group">
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido || ''}
                  onChange={handleChange}
                />
                <button className="save-btn" onClick={() => handleSaveClick('apellido')}>
                  Guardar
                </button>
                <button className="cancel-btn" onClick={() => toggleEditField('apellido')}>
                  Cancelar
                </button>
              </div>
            ) : (
              <span>{formData.apellido ?? ''}</span>
            )}
            {!editingFields.apellido && (
              <button className="edit-btn" onClick={() => toggleEditField('apellido')}>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`}
                  alt="Editar"
                />
              </button>
            )}
          </div>

          {/* Campo Email (solo lectura aquí) */}
          <div className="profile-field">
            <label>Email:</label>
            <span>{user.email ?? ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;