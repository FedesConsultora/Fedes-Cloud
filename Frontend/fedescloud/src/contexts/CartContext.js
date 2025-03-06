// src/contexts/CartContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import config from '../config/config.js';
import { AuthContext } from './AuthContext.js';
import Swal from 'sweetalert2';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // NUEVO: Estado para guardar el catálogo de complementos
  const [catalogComplements, setCatalogComplements] = useState([]);

  // Función para crear un carrito vacío
  const createCart = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_usuario: user.id_usuario }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(data.data);
      } else {
        Swal.fire('Error', data.message || 'No se pudo crear el carrito', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  }, [user]);

  // Función para obtener el carrito activo del usuario
  const fetchCart = useCallback(async () => {
    setLoading(true);
    if (!user || !user.id_usuario) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${config.API_URL}/cart/user/${user.id_usuario}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
        await createCart();
      } else {
        setCart(data.data);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, createCart]);

  // NUEVO: Función para obtener todos los complementos del catálogo
  const fetchCatalogComplements = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_URL}/catalogo-complementos`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setCatalogComplements(data.data);
      }
    } catch (error) {
      console.error('Error fetching catalog complements:', error);
    }
  }, []);

  // Efecto para cargar carrito y complementos cuando haya usuario
  useEffect(() => {
    if (user && user.id_usuario) {
      fetchCart();
      fetchCatalogComplements(); // cargamos también el catálogo
    }
  }, [user, fetchCart, fetchCatalogComplements]);

  // Función para actualizar el carrito en el contexto
  const updateCart = (newCart) => {
    setCart(newCart);
  };

  // Función para limpiar el carrito (por ejemplo, al cerrar sesión)
  const clearCart = () => {
    setCart(null);
  };

  const addComplementToCartItem = useCallback(
    async (id_item_carrito, complementoData) => {
      try {
        const response = await fetch(`${config.API_URL}/cart-item-addons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id_item_carrito,
            tipoComplemento: complementoData.tipoComplemento,
            precio: complementoData.precio,
            descripcionComplemento: complementoData.descripcionComplemento,
            categoria: complementoData.categoria,
            id_catalogo: complementoData.id_catalogo,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Volvemos a traer el carrito actualizado
          fetchCart();
        } else {
          Swal.fire('Error', data.message || 'No se pudo agregar el complemento', 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    },
    [fetchCart]
  );

  // NUEVO: Función para quitar un complemento de un ítem del carrito
  const removeComplementFromCartItem = useCallback(
    async (id_complemento_item) => {
      try {
        const response = await fetch(`${config.API_URL}/cart-item-addons/${id_complemento_item}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          fetchCart();
        } else {
          Swal.fire('Error', data.message || 'No se pudo quitar el complemento', 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    },
    [fetchCart]
  );

  // NUEVO: Función para eliminar un ítem del carrito (junto con sus complementos)
  const deleteCartItem = useCallback(
    async (id_item) => {
      try {
        const response = await fetch(`${config.API_URL}/cart-items/${id_item}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          fetchCart();
        } else {
          Swal.fire('Error', data.message || 'No se pudo eliminar el ítem', 'error');
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    },
    [fetchCart]
  );

  // Calcular la cantidad total de items en el carrito
  const cartCount =
    cart && cart.items
      ? cart.items.reduce((total, item) => total + parseInt(item.cantidad, 10), 0)
      : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        updateCart,
        clearCart,
        loading,
        fetchCart,
        cartCount,
        catalogComplements,
        addComplementToCartItem,
        removeComplementFromCartItem,
        deleteCartItem, // Agregado
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
