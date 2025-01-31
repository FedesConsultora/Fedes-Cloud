// seeders/XXXXXXXXXXXXXX-usuario-seeder.js
'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener los IDs de Rol y Autenticacion
    const roles = await queryInterface.sequelize.query(
      `SELECT id_rol, nombre FROM Rol;`
    );
    const autenticaciones = await queryInterface.sequelize.query(
      `SELECT id_autenticacion, tipoAutenticacion FROM Autenticacion;`
    );

    const rolesRows = roles[0];
    const autenticacionesRows = autenticaciones[0];

    const adminRole = rolesRows.find(role => role.nombre === 'Admin');
    const internoRole = rolesRows.find(role => role.nombre === 'Interno');
    const externoRole = rolesRows.find(role => role.nombre === 'Externo');

    const localAuth = autenticacionesRows.find(auth => auth.tipoAutenticacion === 'Local');

    // Hashear passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const internoPassword = await bcrypt.hash('Interno@123', 10);
    const externoPassword = await bcrypt.hash('Externo@123', 10);

    await queryInterface.bulkInsert('Usuario', [
      {
        nombre: 'Administrador',
        apellido: 'Principal',
        email: 'admin@example.com',
        password: adminPassword,
        fechaNacimiento: '1980-01-01',
        ultimaActividad: new Date(),
        preferenciasNotificaciones: true,
        id_estado: 1, // Asumiendo que 'Activo' tiene id_estado = 1
        id_rol: adminRole.id_rol,
        id_autenticacion: localAuth.id_autenticacion,
        shopperId: null, // Inicialmente null
        googleId: null,  // Inicialmente null
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Interno',
        apellido: 'Empleado',
        email: 'interno@example.com',
        password: internoPassword,
        fechaNacimiento: '1990-02-02',
        ultimaActividad: new Date(),
        preferenciasNotificaciones: true,
        id_estado: 1,
        id_rol: internoRole.id_rol,
        id_autenticacion: localAuth.id_autenticacion,
        shopperId: null, // Inicialmente null
        googleId: null,  // Inicialmente null
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Externo',
        apellido: 'Cliente',
        email: 'externo@example.com',
        password: externoPassword,
        fechaNacimiento: '1995-03-03',
        ultimaActividad: new Date(),
        preferenciasNotificaciones: true,
        id_estado: 1,
        id_rol: externoRole.id_rol,
        id_autenticacion: localAuth.id_autenticacion,
        shopperId: null, // Inicialmente null
        googleId: null,  // Inicialmente null
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Puedes añadir más usuarios según sea necesario
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuario', null, {});
  }
};
