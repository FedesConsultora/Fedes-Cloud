const { Sequelize } = require('sequelize');

// Crea una instancia de Sequelize usando la configuración de tu archivo config.json
const sequelize = new Sequelize('FedesCloud', 'root', 'Enziitho13579', {
  host: '127.0.0.1',
  dialect: 'mysql'
});

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecuta la función de prueba
testConnection();
