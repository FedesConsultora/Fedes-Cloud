// src/components/CartSummary.jsx
import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../contexts/CartContext.js';
import config from '../config/config.js';

const CartSummary = ({ navigate }) => {
  const { cart } = useContext(CartContext);
  const [taxPercentage, setTaxPercentage] = useState(0); // en formato decimal (ej: 0.21)

  // Consulta al endpoint de impuestos para obtener el IVA
  useEffect(() => {
    const fetchTax = async () => {
      try {
        // Suponiendo que el endpoint GET /impuestos devuelve un array de impuestos
        const response = await fetch(`${config.API_URL}/impuestos`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok && data.success) {
          // Buscamos el impuesto con nombre "IVA"
          const iva = data.data.find((imp) => imp.nombre.toLowerCase() === 'iva');
          if (iva) {
            // Convertimos el porcentaje (ej: 21.00) a formato decimal (0.21)
            setTaxPercentage(parseFloat(iva.porcentaje) / 100);
          }
        }
      } catch (error) {
        console.error('Error fetching tax:', error);
      }
    };

    fetchTax();
  }, []);

  // Calcula el subtotal sin IVA sumando el subtotal de cada ítem y sus complementos.
  const calculateSubTotal = () => {
    let subtotal = 0;
    if (cart && cart.items) {
      cart.items.forEach((item) => {
        subtotal += parseFloat(item.subtotal);
        if (item.complementos && item.complementos.length > 0) {
          item.complementos.forEach((addon) => {
            subtotal += parseFloat(addon.precio);
          });
        }
      });
    }
    return subtotal;
  };

  const subTotal = calculateSubTotal();
  const iva = subTotal * taxPercentage;
  const totalWithIva = subTotal + iva;
  console.log('items del cart: ', cart.items);
  return (
    <div className="cart-right">
      <div className="summary-section">
        <h3>Resumen de Compra</h3>

        {/* Listado de Items con sus complementos */}
        {cart && cart.items && cart.items.length > 0 && (
          <div className="summary-items">
            {cart.items.map((item) => (
              <div key={item.id_item} className="summary-item">
                <div className="summary-item-details">
                  <span className="summary-item-title">
                    {item.descripcion} (x{item.cantidad})
                  </span>
                </div>
                <div className='summary-item-price'>
                Precio:  ARS {item.subtotal}
                </div>
                {item.complementos && item.complementos.length > 0 && (
                  <ul className="summary-item-addons">
                    {item.complementos.map((addon) => (
                      <li key={addon.id_complemento} className="summary-addons-detail">
                        <strong>{addon.tipoComplemento}</strong> - ARS {addon.precio}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="summary-item-price">
                  Subtotal: ARS {item.subtotal}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Se muestra el IVA calculado */}
        <p className="summary-iva">
          <strong>IVA ({(taxPercentage * 100).toFixed(0)}%):</strong> ARS {iva.toFixed(2)}
        </p>
        {/* Se muestra el total con IVA */}
        <p className="summary-total">
          <strong>Total a pagar:</strong> ARS {totalWithIva.toFixed(2)}
        </p>

        <button className="checkout-button" onClick={() => navigate('/checkout')}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
