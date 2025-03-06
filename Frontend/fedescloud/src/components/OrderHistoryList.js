// src/components/OrderHistoryList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import '../styles/scss/components/_orderHistoryList.scss';

const OrderHistoryList = ({ history }) => {
  // Ordenar el historial de forma descendente por fecha (más reciente primero)
  const sortedHistory = [...history].sort((a, b) => new Date(b.fechaCambio) - new Date(a.fechaCambio));

  return (
    <div className="order-history-list">
      <h3>Historial de la Orden</h3>
      {sortedHistory.length === 0 ? (
        <p className="no-history">No hay historial disponible.</p>
      ) : (
        <ul>
          {sortedHistory.map((entry) => (
            <li key={entry.id_historial} className="history-item">
              <div className="history-item-header">
                <span className="history-date">
                  {new Date(entry.fechaCambio).toLocaleString()}
                </span>
                <span className="history-status">
                  {entry.estadoNuevo}
                </span>
              </div>
              <div className="history-item-body">
                <p>
                  <strong>Estado anterior:</strong>{' '}
                  {entry.estadoAnterior || 'N/A'}
                </p>
                <p>
                  <strong>Comentario:</strong>{' '}
                  {entry.comentario || '-'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

OrderHistoryList.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id_historial: PropTypes.number.isRequired,
      estadoAnterior: PropTypes.string,
      estadoNuevo: PropTypes.string.isRequired,
      comentario: PropTypes.string,
      fechaCambio: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default OrderHistoryList;
