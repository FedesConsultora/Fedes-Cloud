// src/pages/OrdersPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import config from '../config/config.js';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/ordenes/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok) {
        setOrders(result.data);
      } else {
        Swal.fire('Error', result.message || 'Error al obtener órdenes', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      // Actualiza cada 5 minutos
      const intervalId = setInterval(fetchOrders, 300000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  return (
    <div className="orders-page">
      <h2>Mis Pedidos</h2>
      <button className="refresh-button" onClick={fetchOrders}>Refrescar</button>
      {loading ? (
        <p>Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p>No tienes pedidos.</p>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <div
              key={order.id_orden}
              className="order-card"
              onClick={() => navigate(`/pedidos/${order.id_orden}`)}
            >
              <h3>Orden #{order.id_orden}</h3>
              <p><strong>Monto Total:</strong> ARS {order.montoTotal}</p>
              <p><strong>Moneda:</strong> {order.moneda}</p>
              <p>
                <strong>Estado:</strong> {order.estadoOrden ? order.estadoOrden.nombre : 'Sin estado'}
              </p>
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
