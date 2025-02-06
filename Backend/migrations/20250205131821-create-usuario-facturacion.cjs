module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UsuarioFacturacion', {
      id_facturacion: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      razonSocial: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      domicilio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ciudad: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provincia: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pais: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      condicionIVA: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Usuario',
          key: 'id_usuario',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UsuarioFacturacion');
  },
};
