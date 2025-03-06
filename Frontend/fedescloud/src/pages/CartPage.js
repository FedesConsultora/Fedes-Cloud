// src/pages/CartPage.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext.js';
import { AuthContext } from '../contexts/AuthContext.js';
import { Player } from '@lottiefiles/react-lottie-player';
import CartItem from '../components/CartItem.js';
import CartSummary from '../components/CartSummary.js';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart, loading, fetchCart, cartCount } = useContext(CartContext);

  useEffect(() => {
    if (user && user.id_usuario) {
      fetchCart();
    }
  }, [user, fetchCart]);

  if (loading) return <p className="cart-loading">Cargando carrito...</p>;

  if (!cart || !cart.items || cart.items.length === 0)
    return (
      <div className="cart-empty">
        <Player
          autoplay
          loop
          src="/assets/videos/cartVacio.json"
          style={{ height: '300px', width: '300px' }}
        />
        <p>Tu carrito está vacío.</p>
      </div>
    );

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Columna izquierda: Lista de ítems */}
        <div className="cart-left">
          <header className="cart-header">
            <h2>Tu Carrito</h2>
            <div className="cart-summary-header">
              <span className="item-count">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </header>
          <div className="cart-items-container">
            {cart.items.map((item) => (
              <CartItem key={item.id_item} item={item} />
            ))}
          </div>
        </div>

        {/* Columna derecha: Resumen de compra */}
        <CartSummary navigate={navigate} />
      </div>
    </div>
  );
};

export default CartPage;
