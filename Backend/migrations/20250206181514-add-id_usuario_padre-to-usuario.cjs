'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Usuario', 'id_usuario_padre', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'Usuario', 
        key: 'id_usuario',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Usuario', 'id_usuario_padre');
  }
};
