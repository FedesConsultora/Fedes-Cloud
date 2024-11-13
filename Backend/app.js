// app.js

import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de entorno antes de cualquier otra importación

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { swaggerUi, swaggerDocs } from './docs/swagger.js';

const app = express();


// Middleware de Seguridad HTTP
app.use(helmet());


// Middleware de CORS
// Configura CORS para permitir solicitudes desde tu frontend
const corsOptions = {
  origin: 'https://localhost:3000', // Reemplaza con la URL de tu frontend
  optionsSuccessStatus: 200,
  credentials: true, // Si necesitas enviar cookies o encabezados de autorización
};
app.use(cors(corsOptions));


// Middleware de Rate Limiting
// Limita el número de solicitudes por IP para prevenir ataques de fuerza bruta y DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 solicitudes por IP por ventana
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo después de 15 minutos',
});
app.use('/api/', apiLimiter);


// Middleware de Parsing de Cuerpo
// Permite parsear solicitudes con cuerpos JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Middleware de Sanitización
// Protege contra ataques XSS sanitizando las entradas
app.use(xss());


// Middleware de Rutas de la API
app.use('/', routes);


// Documentación de la API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware de Manejo de Errores
// Debe estar después de todas las rutas y otros middlewares
app.use(errorHandler);

export default app;
