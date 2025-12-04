const dotenv = require('dotenv');

dotenv.config();

const DB_URL = process.env.DB_URL || 'localhost';
const DB_ADMIN = process.env.DB_ADMIN || 'root';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'defaultdb';

const DB_SSL_MODE = process.env.DB_SSL_MODE || 'REQUIRED';

const buildDatabaseUrl = () => {
  const encodedPassword = encodeURIComponent(DB_PASSWORD);
  
  const databaseUrl = `mysql://${DB_ADMIN}:${encodedPassword}@${DB_URL}:${DB_PORT}/${DB_NAME}?ssl-mode=${DB_SSL_MODE}&timezone=%2B09:00`;
  
  process.env.DATABASE_URL = databaseUrl;
  
  return databaseUrl;
};

const DATABASE_URL = buildDatabaseUrl();

module.exports = {
  DB_URL,
  DB_ADMIN,
  DB_PORT,
  DB_NAME,
  DB_SSL_MODE,
  DATABASE_URL,
};
