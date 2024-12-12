'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuario', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Usuario', 'twoFactorEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuario', 'avatar');
    await queryInterface.removeColumn('Usuario', 'twoFactorEnabled');
  }
};
