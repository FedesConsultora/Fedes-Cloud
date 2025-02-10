'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuario', 'id_usuario_padre');
    await queryInterface.removeColumn('Usuario', 'subRol');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuario', 'id_usuario_padre', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });
    await queryInterface.addColumn('Usuario', 'subRol', {
      type: Sequelize.ENUM('No configurado', 'Administrador', 'Facturación', 'Registrante', 'Técnico'),
      allowNull: true,
      defaultValue: 'No configurado',
    });
  }
};
