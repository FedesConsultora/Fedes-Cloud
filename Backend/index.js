// index.js
import app from './app.js';
import { sequelize } from './models/index.js';
import logger from './utils/logger.js';


// Define el puerto en el que el servidor escuchará
const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor y conectar a la base de datos
const startServer = async () => {
  try {
    // Autentica la conexión con la base de datos
    await sequelize.authenticate();
    
    logger.info('Conexión a la base de datos establecida con éxito.');

    // Sincroniza los modelos con la base de datos (opcional)
    // await sequelize.sync({ alter: true }); // Usa con precaución en producción

    // Inicia el servidor Express
    app.listen(PORT, () => {
      logger.info(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    logger.error('No se pudo conectar a la base de datos:', err);
    process.exit(1); // Termina el proceso con un fallo
  }
};

// Inicia el servidor
startServer();
