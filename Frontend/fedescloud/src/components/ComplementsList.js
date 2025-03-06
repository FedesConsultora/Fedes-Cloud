// src/components/ComplementsList.jsx
import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../contexts/CartContext.js';

// Función auxiliar para extraer la capacidad (ej. "5GB") de la descripción
const getBackupCapacity = (desc) => {
  const match = desc.match(/(\d+GB)/i);
  return match ? match[1] : desc;
};

const ComplementsList = ({ item }) => {
  const {
    catalogComplements,
    addComplementToCartItem,
    removeComplementFromCartItem,
  } = useContext(CartContext);

  // Complementos normales para cualquier producto
  const normalComplements = catalogComplements.filter(
    (comp) =>
      comp.categoria.toLowerCase() === item.tipoProducto.toLowerCase()
  );

  // Mostrar complementos de backup únicamente si el producto es de tipo HOSTING
  const showBackup = item.tipoProducto.toLowerCase().includes('hosting');
  const backupComplements = showBackup
    ? catalogComplements
        .filter((comp) => comp.categoria.toLowerCase() === 'hosting-backup')
        .sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio))
    : [];

  // Verificar si un complemento (por id_catalogo) está ya seleccionado en este ítem
  const isComplementSelected = (catalogId) => {
    if (!item.complementos) return false;
    return item.complementos.some((addon) => addon.id_catalogo === catalogId);
  };

  // Toggle para complementos "normales"
  const handleToggleComplement = async (catalogId) => {
    const currentScrollY = window.scrollY;
    const comp = catalogComplements.find((c) => c.id_catalogo === catalogId);
    if (!comp) return;
    const alreadySelected = isComplementSelected(catalogId);
    if (alreadySelected) {
      // Si ya está seleccionado, lo removemos
      const addonToRemove = item.complementos.find(
        (ad) => ad.id_catalogo === catalogId
      );
      if (addonToRemove) {
        await removeComplementFromCartItem(addonToRemove.id_complemento);
      }
    } else {
      // Si no está seleccionado, lo agregamos
      await addComplementToCartItem(item.id_item, {
        id_catalogo: comp.id_catalogo,
        tipoComplemento: comp.tipoComplemento,
        precio: comp.precio,
        descripcionComplemento: comp.descripcionComplemento,
        categoria: comp.categoria,
      });
    }
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 50);
  };

  // Manejo de backup: solo se muestra si el producto es de tipo hosting
  const defaultBackupValue =
    backupComplements.length > 0 ? backupComplements[0].id_catalogo.toString() : '';
  const [selectedBackupOption, setSelectedBackupOption] = useState(defaultBackupValue);

  const currentBackup = item.complementos
    ? item.complementos.find(
        (ad) => ad.categoria.toLowerCase() === 'hosting-backup'
      )
    : null;

  useEffect(() => {
    if (currentBackup) {
      setSelectedBackupOption(currentBackup.id_catalogo.toString());
    } else {
      setSelectedBackupOption(defaultBackupValue);
    }
  }, [currentBackup, defaultBackupValue]);

  const handleBackupChange = (e) => {
    setSelectedBackupOption(e.target.value);
  };

  const handleToggleBackup = async () => {
    const currentScrollY = window.scrollY;
    if (currentBackup) {
      // Si ya hay backup, lo quitamos
      await removeComplementFromCartItem(currentBackup.id_complemento);
    } else {
      const comp = backupComplements.find(
        (c) => c.id_catalogo.toString() === selectedBackupOption
      );
      if (comp) {
        await addComplementToCartItem(item.id_item, {
          id_catalogo: comp.id_catalogo,
          tipoComplemento: comp.tipoComplemento,
          precio: comp.precio,
          descripcionComplemento: comp.descripcionComplemento,
          categoria: comp.categoria,
        });
      }
    }
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 100);
  };

  const getToggleLabel = (selected) => (selected ? 'Agregado' : 'Agregar');

  return (
    <div className="complements-list">
      {/* Complementos normales */}
      {normalComplements.map((comp) => {
        const selected = isComplementSelected(comp.id_catalogo);
        return (
          <div key={comp.id_catalogo} className="complement-item">
            <div className="complement-info">
              <h4 className="complement-title">{comp.tipoComplemento}</h4>
              <p className="complement-desc">{comp.descripcionComplemento}</p>
              <div className="complement-price">ARS {comp.precio}</div>
            </div>
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleToggleComplement(comp.id_catalogo)}
                />
                <span className="slider"></span>
              </label>
              <span className="toggle-label">{getToggleLabel(selected)}</span>
            </div>
          </div>
        );
      })}

      {/* Complemento de backup: solo si es un producto de hosting */}
      {showBackup && backupComplements.length > 0 && (
        <div className="complement-item backup">
          <div className="complement-info">
            <h4 className="complement-title">Backup diario</h4>
            <p className="complement-desc">
              Backup diario de{' '}
              <select
                className="backup-select"
                value={selectedBackupOption}
                onChange={handleBackupChange}
                disabled={!!currentBackup}
              >
                {backupComplements.map((comp) => (
                  <option key={comp.id_catalogo} value={comp.id_catalogo}>
                    {getBackupCapacity(comp.descripcionComplemento)}
                  </option>
                ))}
              </select>{' '}
              para tu sitio web.
            </p>
            <div className="complement-price">
              ARS{' '}
              {
                backupComplements.find(
                  (comp) => comp.id_catalogo.toString() === selectedBackupOption
                )?.precio || ''
              }
            </div>
          </div>
          <div className="toggle-container backup-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={!!currentBackup}
                onChange={handleToggleBackup}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">{getToggleLabel(!!currentBackup)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplementsList;
