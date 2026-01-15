export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const PORT = process.env.PORT || 3000;

export const DB_CONFIG = {
    database: 'todo_app',
    username: 'root',
    password: '',
    host: 'localhost',
    dialect: 'mysql' as const,
}; 