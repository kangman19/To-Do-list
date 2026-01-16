import dotenv from 'dotenv';

dotenv.config(); // Load .env file

// Server config
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// JWT secret
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Database config
export const DB_CONFIG = {
  database: process.env.DB_NAME || 'todo_app',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  dialect: 'mysql' as const,
};
