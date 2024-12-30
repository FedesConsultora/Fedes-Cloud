import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import Swal from 'sweetalert2';
import config from '../config/config.js';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nombre: user?.nombre ?? '',
    apellido: user?.apellido ?? '',
    avatar: user?.avatar ?? null,
  });

  const [editingFields, setEditingFields] = useState({
    avatar: false,
    nombre: false,
    apellido: false,
  });

  if (!user) {
    return <div>No se encontraron datos del usuario.</div>;
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataImage = new FormData();
    formDataImage.append('avatar', file);

    try {
      const response = await fetch(`${config.API_URL}/auth/upload-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formDataImage
      });
      const result = await response.json();
      if (response.ok) {
        setFormData({...formData, avatar: result.url});
        await saveField('avatar', result.url);
      } else {
        Swal.fire('Error', result.message || 'No se pudo subir el avatar', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  const toggleEditField = (field) => {
    setEditingFields((prev) => ({...prev, [field]: !prev[field]}));
  };

  const saveField = async (field, value = formData[field]) => {
    try {
      const response = await fetch(`${config.API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ [field]: value })
      });
      const result = await response.json();
      if (response.ok) {
        updateUser({...user, [field]: value});
        Swal.fire('Éxito', 'Perfil actualizado exitosamente', 'success');
        setEditingFields({...editingFields, [field]: false});
      } else {
        Swal.fire('Error', result.message || 'No se pudo actualizar el perfil', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema con el servidor', 'error');
    }
  };

  const handleSaveClick = (field) => {
    saveField(field);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Perfil del Usuario</h2>
        <div className="profile-info">

          <div className="profile-field avatar-field">
            <div className="avatar-wrapper">
              <img
                src={formData.avatar ?? `${process.env.PUBLIC_URL}/assets/icons/user-placeholder2.png`}
                alt="User Avatar"
                className="user-avatar"
              />
              <div className="avatar-overlay">
                <div className="avatar-overlay-content">
                  <img src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`} alt="Editar" />
                  <span>Editar</span>
                </div>
              </div>
              {editingFields.avatar && (
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              )}
            </div>
            
          </div>

          <div className="profile-field">
            <label>Nombre:</label>
            {editingFields.nombre ? (
              <div className="input-group">
                <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} />
                <button className="save-btn" onClick={() => handleSaveClick('nombre')}>Guardar</button>
                <button className="cancel-btn" onClick={() => toggleEditField('nombre')}>Cancelar</button>
              </div>
            ) : (
              <span>{formData.nombre ?? ''}</span>
            )}
            {!editingFields.nombre && (
              <button className="edit-btn" onClick={() => toggleEditField('nombre')}>
                <img src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`} alt="Editar" />
              </button>
            )}
          </div>

          <div className="profile-field">
            <label>Apellido:</label>
            {editingFields.apellido ? (
              <div className="input-group">
                <input type="text" name="apellido" value={formData.apellido || ''} onChange={handleChange} />
                <button className="save-btn" onClick={() => handleSaveClick('apellido')}>Guardar</button>
                <button className="cancel-btn" onClick={() => toggleEditField('apellido')}>Cancelar</button>
              </div>
            ) : (
              <span>{formData.apellido ?? ''}</span>
            )}
            {!editingFields.apellido && (
              <button className="edit-btn" onClick={() => toggleEditField('apellido')}>
                <img src={`${process.env.PUBLIC_URL}/assets/icons/pencil-icon.webp`} alt="Editar" />
              </button>
            )}
          </div>

          <div className="profile-field">
            <label>Email:</label>
            <span>{user.email ?? ''}</span>
            {/* El email se modifica desde settings */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
