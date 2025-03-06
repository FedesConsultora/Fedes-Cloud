// models/index.js

import Sequelize from 'sequelize';
import config from '../config/config.js';
import usuarioModel from './usuario.js';
import rolModel from './rol.js';
import permisoModel from './permiso.js';
import accionModel from './accion.js';
import estadoModel from './estado.js';
import rolPermisoModel from './rolpermiso.js';
import autenticacionModel from './autenticacion.js';
import certificadoModel from './certificado.js';
import dnsModel from './dns.js';
import dominioModel from './dominio.js';
import servicioModel from './servicio.js';
import dnsRegistroModel from './dnsregistro.js';
import usuarioContactoModel from './usuariocontacto.js';
import usuariofacturacion from './usuariofacturacion.js';
import usuarioPadreHijo from './usuariopadrehijo.js';
import ordenModel from './Orden.js';
import ordenDetalleModel from './OrdenDetalle.js';
import ordenDetalleHistorialModel from './OrdenDetalleHistorial.js';
import pagoModel from './Pago.js';
import estadoOrden from './estadoOrden.js';
import hosting from './hosting.js';
import estadoHosting from './estadoHosting.js';
import carritoModel from './carrito.js';
import itemCarritoModel from './itemCarrito.js';
import complementoItemCarritoModel from './complementoItemCarrito.js';
import catalogoComplementosModel from './catalogoComplementos.js';
import impuestoModel from './impuesto.js';

const env = process.env.NODE_ENV || 'development';
const conf = config[env];

const sequelize = new Sequelize(
  conf.database,
  conf.username,
  conf.password,
  conf
);

const db = {};

db.Usuario = usuarioModel(sequelize, Sequelize.DataTypes);
db.Rol = rolModel(sequelize, Sequelize.DataTypes);
db.Permiso = permisoModel(sequelize, Sequelize.DataTypes);
db.Accion = accionModel(sequelize, Sequelize.DataTypes);
db.Estado = estadoModel(sequelize, Sequelize.DataTypes);
db.RolPermiso = rolPermisoModel(sequelize, Sequelize.DataTypes);
db.Autenticacion = autenticacionModel(sequelize, Sequelize.DataTypes);
db.Certificado = certificadoModel(sequelize, Sequelize.DataTypes);
db.DNS = dnsModel(sequelize, Sequelize.DataTypes);
db.Dominio = dominioModel(sequelize, Sequelize.DataTypes);
db.Servicio = servicioModel(sequelize, Sequelize.DataTypes);
db.DNSRegistro = dnsRegistroModel(sequelize, Sequelize.DataTypes);
db.UsuarioContacto = usuarioContactoModel(sequelize, Sequelize.DataTypes); 
db.UsuarioFacturacion = usuariofacturacion(sequelize, Sequelize.DataTypes);
db.UsuarioPadreHijo = usuarioPadreHijo(sequelize, Sequelize.DataTypes);
db.Orden = ordenModel(sequelize, Sequelize.DataTypes);
db.OrdenDetalle = ordenDetalleModel(sequelize, Sequelize.DataTypes);
db.OrdenDetalleHistorial = ordenDetalleHistorialModel(sequelize, Sequelize.DataTypes);
db.Pago = pagoModel(sequelize, Sequelize.DataTypes);
db.EstadoOrden = estadoOrden(sequelize, Sequelize.DataTypes);
db.Hosting = hosting(sequelize, Sequelize.DataTypes);
db.EstadoHosting = estadoHosting(sequelize, Sequelize.DataTypes);
db.Carrito = carritoModel(sequelize, Sequelize.DataTypes);
db.ItemCarrito = itemCarritoModel(sequelize, Sequelize.DataTypes);
db.ComplementoItemCarrito = complementoItemCarritoModel(sequelize, Sequelize.DataTypes);
db.CatalogoComplementos = catalogoComplementosModel(sequelize, Sequelize.DataTypes);
db.Impuesto = impuestoModel(sequelize, Sequelize.DataTypes);

// Configurar asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exportar modelos como exportaciones nombradas
export { sequelize };
export const Usuario = db.Usuario;
export const Rol = db.Rol;
export const Permiso = db.Permiso;
export const Accion = db.Accion;
export const Estado = db.Estado;
export const RolPermiso = db.RolPermiso;
export const Autenticacion = db.Autenticacion;
export const Certificado = db.Certificado;
export const DNS = db.DNS;
export const Dominio = db.Dominio;
export const Servicio = db.Servicio;
export const DNSRegistro = db.DNSRegistro;
export const UsuarioContacto = db.UsuarioContacto;
export const UsuarioFacturacion = db.UsuarioFacturacion;
export const UsuarioPadreHijo = db.UsuarioPadreHijo;
export const Orden = db.Orden;
export const OrdenDetalle = db.OrdenDetalle;
export const OrdenDetalleHistorial = db.OrdenDetalleHistorial;
export const Pago = db.Pago;
export const EstadoOrden = db.EstadoOrden;
export const Hosting = db.Hosting;
export const EstadoHosting = db.EstadoHosting;
export const Carrito = db.Carrito;
export const ItemCarrito = db.ItemCarrito;
export const ComplementoItemCarrito = db.ComplementoItemCarrito;
export const CatalogoComplementos = db.CatalogoComplementos;
export const Impuesto = db.Impuesto;

export default db;