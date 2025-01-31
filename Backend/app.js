// app.js (Backend)
import dotenv from 'dotenv';
dotenv.config(); 
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { swaggerUi, swaggerDocs } from './docs/swagger.js';
import logger from './utils/logger.js';
import passport from './config/passport.js';
import path from 'path';

const app = express();

// Middleware de Seguridad HTTP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Configurar CORS
const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Cookies
app.use(cookieParser());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde',
});
app.use('/api/', apiLimiter);

// Parseo de cuerpo y sanitización
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());

// Inicializar Passport
app.use(passport.initialize());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/', routes);



// Error Handler
app.use(errorHandler);

// Unhandled Rejections y Uncaught Exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
});

export default app;
