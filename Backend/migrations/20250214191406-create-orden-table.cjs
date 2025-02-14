module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orden', {
      id_orden: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pendiente',
      },
      montoTotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      moneda: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USD',
      },
      metodoPago: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referenciaPago: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    // También puedes crear un foreign key para id_usuario apuntando a la tabla Usuario
    // si lo deseas:
    await queryInterface.addConstraint('Orden', {
      fields: ['id_usuario'],
      type: 'foreign key',
      name: 'fk_orden_usuario',
      references: {
        table: 'Usuario',
        field: 'id_usuario',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orden');
  },
};
