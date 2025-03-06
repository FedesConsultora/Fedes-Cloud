// src/components/CartItem.js
import React, { useContext } from 'react';
import ComplementsList from './ComplementsList.js';
import { CartContext } from '../contexts/CartContext.js';
import Swal from 'sweetalert2';

const CartItem = ({ item }) => {
  const { deleteCartItem } = useContext(CartContext);
  console.log(item);
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el ítem y todos sus complementos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3498db', // primary color
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await deleteCartItem(item.id_item);
      Swal.fire('Eliminado', 'El ítem ha sido eliminado del carrito.', 'success');
    }
  };

  return (
    <div className="cart-item-card">
      {/* Botón de eliminación */}
      <button className="item-delete-btn" onClick={handleDelete}>
        &times;
      </button>

      {/* Información principal del ítem */}
      <div className="item-info">
        <h3 className="item-title">{item.descripcion}</h3>
        <div className="item-details">
          <p>
            <strong>Tipo:</strong> {item.tipoProducto}
          </p>
          <p>
            <strong>Cantidad:</strong> {item.cantidad}
          </p>
          <p>
            <strong>Precio Unitario:</strong> {item.precioUnitario} ARS
          </p>
          <p>
            <strong>Subtotal:</strong> {item.subtotal} ARS
          </p>
        </div>
      </div>

      <ComplementsList item={item} />
    </div>
  );
};

export default CartItem;
