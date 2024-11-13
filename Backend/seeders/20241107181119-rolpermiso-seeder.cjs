// seeders/XXXXXXXXXXXXXX-rolpermiso-seeder.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener los IDs de Rol y Permiso
    const roles = await queryInterface.sequelize.query(
      `SELECT id_rol, nombre FROM Rol;`
    );

    const permisos = await queryInterface.sequelize.query(
      `SELECT id_permiso, nombre FROM Permiso;`
    );

    const rolesRows = roles[0];
    const permisosRows = permisos[0];

    const rolPermiso = [];

    // Asignar permisos al rol 'Admin' (todos los permisos)
    const adminRole = rolesRows.find(role => role.nombre === 'Admin');
    permisosRows.forEach(permiso => {
      rolPermiso.push({
        id_permiso: permiso.id_permiso,
        id_rol: adminRole.id_rol,
        fechaAsignacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Asignar permisos al rol 'Interno' (permisos específicos)
    const internoRole = rolesRows.find(role => role.nombre === 'Interno');
    const internoPermisos = permisosRows.filter(permiso => 
      ['manage_users', 'manage_two_factor_auth'].includes(permiso.nombre)
    );

    internoPermisos.forEach(permiso => {
      rolPermiso.push({
        id_permiso: permiso.id_permiso,
        id_rol: internoRole.id_rol,
        fechaAsignacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Asignar permisos al rol 'Externo' (permisos muy limitados)
    const externoRole = rolesRows.find(role => role.nombre === 'Externo');
    const externoPermisos = permisosRows.filter(permiso => 
      ['read_user'].includes(permiso.nombre)
    );

    externoPermisos.forEach(permiso => {
      rolPermiso.push({
        id_permiso: permiso.id_permiso,
        id_rol: externoRole.id_rol,
        fechaAsignacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await queryInterface.bulkInsert('RolPermiso', rolPermiso, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('RolPermiso', null, {});
  }
};
