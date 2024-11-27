// migrations/xxxx-add-auth-fields-to-usuario.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuario', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Usuario', 'resetPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Usuario', 'emailToken', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Usuario', 'emailConfirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuario', 'resetPasswordToken');
    await queryInterface.removeColumn('Usuario', 'resetPasswordExpires');
    await queryInterface.removeColumn('Usuario', 'emailToken');
    await queryInterface.removeColumn('Usuario', 'emailConfirmed');
  },
};

