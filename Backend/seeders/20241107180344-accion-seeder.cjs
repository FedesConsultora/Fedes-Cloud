// seeders/XXXXXXXXXXXXXX-accion-seeder.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener los IDs de Permiso
    const permisos = await queryInterface.sequelize.query(
      `SELECT id_permiso, nombre FROM Permiso;`
    );

    const permisosRows = permisos[0];

    const acciones = [];

    permisosRows.forEach(permiso => {
      switch (permiso.nombre) {
        case 'manage_users':
          acciones.push(
            {
              nombreAccion: 'create_user',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'read_user',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'update_user',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'delete_user',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
          break;
        case 'manage_roles':
          acciones.push(
            {
              nombreAccion: 'create_role',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'read_role',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'update_role',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'delete_role',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
          break;
        case 'manage_permissions':
          acciones.push(
            {
              nombreAccion: 'create_permission',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'read_permission',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'update_permission',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'delete_permission',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
          break;
        case 'manage_actions':
          acciones.push(
            {
              nombreAccion: 'create_action',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'read_action',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'update_action',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'delete_action',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
          break;
        case 'manage_authentications':
          acciones.push(
            {
              nombreAccion: 'create_authentication',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'read_authentication',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'update_authentication',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'delete_authentication',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
          break;
        case 'manage_two_factor_auth':
          acciones.push(
            {
              nombreAccion: 'enable_two_factor_auth',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'disable_two_factor_auth',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombreAccion: 'read_two_factor_auth',
              id_permiso: permiso.id_permiso,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
          break;
        default:
          break;
      }
    });

    await queryInterface.bulkInsert('Accion', acciones, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Accion', null, {});
  }
};