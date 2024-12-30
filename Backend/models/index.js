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

export default db;
