// src/pages/OrderDetailPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import config from '../config/config.js';
import Swal from 'sweetalert2';
import OrderHistoryList from '../components/OrderHistoryList.js';
import { AuthContext } from '../contexts/AuthContext.js';

const OrderDetailPage = () => {
  const { id_orden } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener los detalles de la orden
  const fetchOrder = async () => {
    try {
      const response = await fetch(`${config.API_URL}/ordenes/${id_orden}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        setOrder(result.data);
      } else {
        Swal.fire('Error', result.message || 'Error al obtener la orden', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // Obtener los estados disponibles
  const fetchStatuses = async () => {
    try {
      const response = await fetch(`${config.API_URL}/estado-orden`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        setStatuses(result.data);
      } else {
        Swal.fire('Error', result.message || 'Error al obtener estados', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // Obtener el historial de la orden
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${config.API_URL}/orden-detalles/historial/${id_orden}/historial`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        setHistory(result.data);
      } else {
        console.log('No se pudo obtener historial:', result.message);
      }
    } catch (err) {
      console.error('Error al obtener historial:', err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchOrder(), fetchStatuses(), fetchHistory()]);
      setLoading(false);
    };
    loadData();
  }, [id_orden]);

  if (loading) return <p>Cargando detalles del pedido...</p>;
  if (!order) return <p>Pedido no encontrado.</p>;

  return (
    <div className="order-detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft size={24} />
      </button>
      <header className="order-header">
        <div className="order-info">
          <h2>Orden #{order.id_orden}</h2>
          <div className="order-statuses">
            {statuses.map((status) => (
              <span
                key={status.id_estado_orden}
                className={
                  order.estadoOrden && order.estadoOrden.id_estado_orden === status.id_estado_orden
                    ? 'status active'
                    : 'status'
                }
              >
                {status.nombre}
              </span>
            ))}
          </div>
        </div>
      </header>
      <section className="order-summary">
        <div className="summary-left">
          <p><strong>Asignado:</strong> {order.id_asignado ? order.id_asignado : 'No asignado'}</p>
          <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="summary-right">
          <p><strong>Monto Total:</strong> ARS {order.montoTotal}</p>
          <p>
            <strong>Contacto:</strong>{' '}
            {user && user.nombre && user.apellido
              ? `${user.nombre} ${user.apellido}`
              : 'N/A'}
          </p>
        </div>
      </section>
      <section className="order-history">
        {history.length > 0 ? (
          <OrderHistoryList history={history} />
        ) : (
          <p>No hay historial disponible.</p>
        )}
      </section>
    </div>
  );
};

export default OrderDetailPage;
