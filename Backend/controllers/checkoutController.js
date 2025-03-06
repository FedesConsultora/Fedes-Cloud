// src/controllers/checkoutController.js
import {
  sequelize,
  Carrito,
  ItemCarrito,
  ComplementoItemCarrito,
  Orden,
  OrdenDetalle,
  OrdenDetalleHistorial,
  Impuesto,
  UsuarioFacturacion,
  UsuarioContacto
} from '../models/index.js';
import logger from '../utils/logger.js';
import GoDaddyService from '../services/goDaddyService.js';
import GoDaddyAdapter from '../adapters/godaddyAdapter.js';
import { generateCSR } from '../utils/csrGenerator.js';

// Instanciar el servicio de GoDaddy
const goDaddyService = new GoDaddyService(new GoDaddyAdapter());

export const checkoutCart = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.body.id_usuario || req.user.id_usuario;
    const idempotencyKey = req.body.idempotencyKey || null;
    
    // Verificar idempotency
    if (idempotencyKey) {
      const existingOrder = await Orden.findOne({
        where: { idempotencyKey, id_usuario: userId }
      }, { transaction });
      if (existingOrder) {
        await transaction.commit();
        return res.status(200).json({
          success: true,
          message: 'Orden ya creada previamente.',
          data: existingOrder,
        });
      }
    }
    
    // Recuperar el carrito activo
    const carrito = await Carrito.findOne({
      where: { id_usuario: userId, estado: 'active' },
      include: [
        {
          model: ItemCarrito,
          as: 'items',
          include: [{ model: ComplementoItemCarrito, as: 'complementos' }]
        }
      ]
    }, { transaction });
    
    if (!carrito || !carrito.items || carrito.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío.'
      });
    }
    
    // Actualizar el carrito a "procesado" para evitar reprocesos
    await carrito.update({ estado: 'procesado' }, { transaction });
    
    // Transformar cada ítem en un detalle de orden
    const detalles = [];
    for (const item of carrito.items) {
      let complementosInfo = [];
      let complementosTotal = 0;
      if (item.complementos && item.complementos.length > 0) {
        complementosInfo = item.complementos.map(comp => {
          complementosTotal += parseFloat(comp.precio);
          return {
            tipoComplemento: comp.tipoComplemento,
            descripcionComplemento: comp.descripcionComplemento,
            precio: comp.precio,
            categoria: comp.categoria,
            id_catalogo: comp.id_catalogo,
          };
        });
      }
      const baseSubtotal = parseFloat(item.subtotal);
      let totalForItem = baseSubtotal + complementosTotal;
      // Combinar metaDatos del item (si existe) con la información de complementos
      let metaDatos = { complementos: complementosInfo, ...item.metaDatos };
      console.log('metaDatos', metaDatos);
      
      // Procesar según el tipo de producto
      if (item.tipoProducto === 'CERTIFICADO_SSL') {
        try {
          let commonName = metaDatos.domain || item.descripcion;
          if (!commonName.includes('.')) {
            commonName = commonName + '.com';
          }
          const periodValue = metaDatos.period || 60;
          const payloadExternal = {
            productType: 'DV_SSL',
            commonName,
            period: periodValue,
            contact: {
              email: metaDatos.verificationEmail || 'default@example.com',
              nameFirst: metaDatos.contact?.nameFirst || 'John',
              nameLast: metaDatos.contact?.nameLast || 'Doe'
            },
            callbackUrl: metaDatos.callbackUrl || '',
            csr: '',
            subjectAlternativeNames: []
          };
          // Generar CSR si no se proporciona
          if (!payloadExternal.csr || payloadExternal.csr === '') {
            const { csr: generatedCSR } = await generateCSR(commonName);
            payloadExternal.csr = generatedCSR;
          }
          console.log('payloadExternal', payloadExternal);
          const externalResult = await goDaddyService.createCertificateOrder(payloadExternal);
          metaDatos.externalOrder = externalResult;
        } catch (err) {
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: `Error al procesar certificado: ${err.message}`,
          });
        }
      } else if (item.tipoProducto === 'DOMINIO') {
        try {
          let domainName = metaDatos.domain || item.descripcion;
          if (!domainName.includes('.')) {
            domainName = domainName + '.com';
          }
          
          // Consultar datos de facturación y de contacto
          let billingRecord = await UsuarioFacturacion.findOne({ where: { id_usuario: userId } });
          let contactRecord = await UsuarioContacto.findOne({ where: { id_usuario: userId } });
          
          // Valores por defecto en caso de que no existan registros:
          if (!billingRecord) {
            billingRecord = {
              domicilio: 'Default Billing Address',
              ciudad: 'Default City',
              provincia: 'CA', // Valor válido para EE.UU.
              pais: 'US'
            };
          } else {
            billingRecord = {
              domicilio: billingRecord.domicilio || 'Default Billing Address',
              ciudad: billingRecord.ciudad || 'Default City',
              provincia: billingRecord.provincia || 'CA', // Aseguramos un estado válido
              pais: billingRecord.pais || 'US'
            };
          }
          if (!contactRecord) {
            contactRecord = {
              nameFirst: 'Nombre',
              nameLast: 'Apellido',
              email: 'default@example.com',
              phone: '+1.1234567890'
            };
          } else {
            contactRecord = {
              nameFirst: contactRecord.nameFirst || 'Nombre',
              nameLast: contactRecord.nameLast || 'Apellido',
              email: contactRecord.email || 'default@example.com',
              phone: (contactRecord.phone && contactRecord.phone.startsWith('+'))
                        ? contactRecord.phone
                        : '+1.1234567890'
            };
          }
          
          // Construir payload para registrar el dominio según el esquema de GoDaddy
          const payloadDomain = {
            domain: domainName,
            period: metaDatos.period || 1,
            renewAuto: true,
            consent: {
              agreedAt: new Date().toISOString(),
              agreedBy: req.ip || '127.0.0.1',
              agreementKeys: ['DNRA']
            },
            contactAdmin: {
              addressMailing: {
                address1: 'Default Admin Address',
                address2: '',
                city: 'Default City',
                state: 'CA', // Estado válido
                postalCode: '00000',
                country: 'US'
              },
              email: contactRecord.email,
              fax: '',
              jobTitle: '',
              nameFirst: contactRecord.nameFirst,
              nameLast: contactRecord.nameLast,
              nameMiddle: '',
              organization: '',
              phone: contactRecord.phone
            },
            contactBilling: {
              addressMailing: {
                address1: billingRecord.domicilio,
                address2: '',
                city: billingRecord.ciudad,
                state: billingRecord.provincia,
                postalCode: '00000',
                country: billingRecord.pais
              },
              nameFirst: contactRecord.nameFirst,
              nameLast: contactRecord.nameLast,
              email: contactRecord.email,
              phone: contactRecord.phone
            },
            contactRegistrant: {
              addressMailing: {
                address1: 'Default Registrant Address',
                address2: '',
                city: 'Default City',
                state: 'CA',
                postalCode: '00000',
                country: 'US'
              },
              nameFirst: contactRecord.nameFirst,
              nameLast: contactRecord.nameLast,
              email: contactRecord.email,
              phone: contactRecord.phone
            },
            contactTech: {
              addressMailing: {
                address1: 'Default Tech Address',
                address2: '',
                city: 'Default City',
                state: 'CA',
                postalCode: '00000',
                country: 'US'
              },
              nameFirst: contactRecord.nameFirst,
              nameLast: contactRecord.nameLast,
              email: contactRecord.email,
              phone: contactRecord.phone
            }
          };
          
          console.log('payloadDomain', payloadDomain);
          const externalResult = await goDaddyService.registerDomain(domainName, payloadDomain);
          metaDatos.externalOrder = externalResult;
        } catch (err) {
          await transaction.rollback();
          return res.status(500).json({
            success: false,
            message: `Error al procesar dominio: ${err.message}`,
          });
        }
      }
      
      detalles.push({
        tipoProducto: item.tipoProducto,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: (totalForItem / item.cantidad).toFixed(2),
        subtotal: totalForItem.toFixed(2),
        metaDatos,
      });
    }
    
    // Calcular subtotal, IVA y total final
    const subTotal = detalles.reduce((acc, det) => acc + parseFloat(det.subtotal), 0);
    const iva = subTotal * 0.21;
    const totalWithIva = (subTotal + iva).toFixed(2);
    
    // Crear la orden local
    const nuevaOrden = await Orden.create({
      id_usuario: userId,
      montoTotal: totalWithIva,
      moneda: 'ARS',
      metodoPago: null,
      idempotencyKey,
    }, { transaction });
    
    // Insertar cada detalle y registrar el historial
    for (const det of detalles) {
      const createdDetalle = await OrdenDetalle.create({
        id_orden: nuevaOrden.id_orden,
        tipoProducto: det.tipoProducto,
        descripcion: det.descripcion,
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario,
        subtotal: det.subtotal,
        metaDatos: det.metaDatos,
      }, { transaction });
    
      await OrdenDetalleHistorial.create({
        id_detalle: createdDetalle.id_detalle,
        estadoAnterior: null,
        estadoNuevo: 'Pendiente',
        comentario: `Detalle creado al realizar checkout. Producto: ${det.tipoProducto}`,
        // Usamos el id_usuario obtenido previamente
        id_usuario: userId,
        fechaCambio: new Date(),
      }, { transaction });
    }
    
    // Vaciar el carrito eliminando sus ítems
    await ItemCarrito.destroy({ where: { id_carrito: carrito.id_carrito } }, { transaction });
    
    await transaction.commit();
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente (con IVA incluido) y el carrito ha sido vaciado.',
      data: nuevaOrden,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error al realizar checkout del carrito: ${error.message}`);
    next(error);
  }
};
