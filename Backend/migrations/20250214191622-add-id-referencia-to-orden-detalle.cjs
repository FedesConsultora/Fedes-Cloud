module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('OrdenDetalle', 'id_referencia', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      after: 'tipoProducto', // posición opcional
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('OrdenDetalle', 'id_referencia');
  },
};
