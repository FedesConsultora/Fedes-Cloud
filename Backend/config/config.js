import dotenv from 'dotenv';

dotenv.config();

export default {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'FedesCloud',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    clientId: process.env.GOOGLE_CLIENT_ID,
    secretId: process.env.GOOGLE_CLIENT_SECRET
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE_TEST || 'FedesCloud_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    clientId: process.env.CLIENT_ID,
    secretId: process.env.CLIENT_SECRET
  },
  production: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE_PRODUCTION || 'FedesCloud_production',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    clientId: process.env.CLIENT_ID,
    secretId: process.env.CLIENT_SECRET
  }
};
