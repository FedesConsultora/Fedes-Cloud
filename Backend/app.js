// app.js
import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { sequelize } from './models/index.js';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar el router base
app.use('/api', routes);

// Middleware de manejo de errores
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor y conectar a la base de datos
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err);
  }
};

startServer();
