// src/pages/CheckoutPage.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext.js';
import { AuthContext } from '../contexts/AuthContext.js';
import config from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const checkoutCalled = useRef(false);

  // Generar un idempotency key al montar el componente
  const [idempotencyKey] = useState(uuidv4());

  const handleCheckout = async () => {
    if (checkoutCalled.current) return;
    checkoutCalled.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/cart/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          id_usuario: user.id_usuario,
          idempotencyKey // Se envía la clave de idempotencia
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setOrder(data.data);
        await fetchCart();
      } else {
        setError(data.message || 'Error al procesar el checkout.');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="checkout-page" style={{ padding: '2rem', textAlign: 'center' }}>
      {loading && <p>Cargando, por favor espere...</p>}
      {error && (
        <div>
          <p>Error: {error}</p>
          <button className="checkout-button" onClick={handleCheckout}>
            Intentar de nuevo
          </button>
        </div>
      )}
      {order && (
        <div>
          <h2>Orden creada exitosamente</h2>
          <p>ID de orden: {order.id_orden}</p>
          <p>Monto Total: ARS {order.montoTotal}</p>
          <button className="checkout-button" onClick={handleContinue}>
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
