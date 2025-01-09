// seeders/20241107181119-rolpermiso-seeder.cjs
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Importamos dinámicamente tu archivo de configuración (ES Module)
    const { rolesPermissionsConfig } = await import('../config/rolesPermissionsConfig.js');

    // 2. Obtenemos roles y permisos de la BD (sin comillas dobles, válido para MySQL)
    const [roles] = await queryInterface.sequelize.query(`
      SELECT id_rol, nombre
      FROM Rol
    `);
    const [permisos] = await queryInterface.sequelize.query(`
      SELECT id_permiso, nombre
      FROM Permiso
    `);

    // 3. Armamos las relaciones Rol-Permiso
    const rolPermisoArray = [];

    for (const [nombreRol, permisosRol] of Object.entries(rolesPermissionsConfig)) {
      const rolEncontrado = roles.find(r => r.nombre === nombreRol);
      if (!rolEncontrado) continue;

      permisosRol.forEach(nombrePermiso => {
        const permisoEncontrado = permisos.find(p => p.nombre === nombrePermiso);
        if (!permisoEncontrado) return;

        rolPermisoArray.push({
          id_permiso: permisoEncontrado.id_permiso,
          id_rol: rolEncontrado.id_rol,
          fechaAsignacion: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }

    // 4. Insertamos en la tabla pivote "RolPermiso"
    if (rolPermisoArray.length) {
      await queryInterface.bulkInsert('RolPermiso', rolPermisoArray, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Elimina todas las relaciones de la tabla "RolPermiso"
    await queryInterface.bulkDelete('RolPermiso', null, {});
  },
};
