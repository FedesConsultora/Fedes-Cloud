'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UsuarioPadreHijo', 'estado_invitacion', {
      type: Sequelize.ENUM('Pendiente', 'Aceptada', 'Rechazada'),
      allowNull: false,
      defaultValue: 'Pendiente'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UsuarioPadreHijo', 'estado_invitacion');
  }
};
