// src/pages/Profile.js
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const Profile = () => {
  const { user, updateUser, accessAsParent } = useContext(AuthContext);

  // Estado local para "nombre", "apellido" y "avatar"
  const [formData, setFormData] = useState({
    nombre: user?.nombre ?? '',
    apellido: user?.apellido ?? '',
    avatar: user?.avatar ?? null,
  });

  // Estado para manejar el modo edición de nombre y apellido.
  const [editingFields, setEditingFields] = useState({
    nombre: false,
    apellido: false,
  });

  // Referencia para el input oculto de avatar.
  const fileInputRef = useRef(null);

  if (!user) {
    return <div>No se encontraron datos del usuario.</div>;
  }

  // Función para actualizar los valores de los inputs.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para hacer click en el input de avatar de forma programática.
  const handleAvatarClick = () => {
    if (fileInputRef.current && !accessAsParent) {
      fileInputRef.current.click();
    } else if (accessAsParent) {
      Swal.fire('Atención', 'Solo el dueño de la cuenta puede editar el perfil.', 'info');
    }
  };

  // Función para subir el avatar.
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append('avatar', file);

    try {
      const response = await fetch(`${config.API_URL}/auth/upload-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formDataImage,
      });
      const result = await response.json();
      if (response.ok) {
        setFormData((prev) => ({ ...prev, avatar: result.url }));
        await saveField('avatar', result.url);
      } else {
        Swal.fire('Error', result.message || 'No se pudo subir el avatar', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  // Función para alternar el modo edición de un campo.
  const toggleEditField = (field) => {
    if (accessAsParent) {
      Swal.fire('Atención', 'Solo el dueño de la cuenta puede editar el perfil de usuario.', 'info');
      return;
    }
    setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Función para llamar al endpoint y actualizar un campo.
  const saveField = async (field, value = formData[field]) => {
    if (accessAsParent) {
      Swal.fire('Atención', 'Solo el dueño de la cuenta puede editar el perfil de usuario.', 'info');
      return;
    }
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
        if (field !== 'avatar') {
          setEditingFields((prev) => ({ ...prev, [field]: false }));
        }
      } else {
        Swal.fire('Error', result.message || 'No se pudo actualizar el perfil', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  // Función para guardar cambios al hacer clic en "Guardar".
  const handleSaveClick = (field) => {
    saveField(field);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Perfil del Usuario</h2>
        {accessAsParent && (
          <div className="alert-message">
            Solo el dueño de la cuenta puede editar el perfil de usuario.
          </div>
        )}
        <div className="profile-info">
          {/* Campo Avatar */}
          <div className="profile-field avatar-field">
            <div className="avatar-wrapper">
              <img
                src={formData.avatar ?? `${process.env.PUBLIC_URL}/assets/icons/user-placeholder2.png`}
                alt="User Avatar"
                className="user-avatar"
              />
              {/* Sólo muestra el overlay de edición si no se está en modo cuenta padre */}
              {!accessAsParent && (
                <div className="avatar-overlay" onClick={handleAvatarClick}>
                  <div className="avatar-overlay-content">
                    <img
                      src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`}
                      alt="Editar"
                    />
                    <span>Editar</span>
                  </div>
                </div>
              )}
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
            {editingFields.nombre && !accessAsParent ? (
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
            {!editingFields.nombre && !accessAsParent && (
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
            {editingFields.apellido && !accessAsParent ? (
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
            {!editingFields.apellido && !accessAsParent && (
              <button className="edit-btn" onClick={() => toggleEditField('apellido')}>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`}
                  alt="Editar"
                />
              </button>
            )}
          </div>

          {/* Campo Email (solo lectura) */}
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