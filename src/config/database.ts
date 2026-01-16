import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // load .env variables

export const sequelize = new Sequelize(
  process.env.DB_NAME!,       
  process.env.DB_USER!,       
  process.env.DB_PASSWORD!,   
  {
    host: process.env.DB_HOST!,   
    port: parseInt(process.env.DB_PORT!) || 3306, 
    dialect: 'mysql',
    logging: false, // disable SQL logs
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};
