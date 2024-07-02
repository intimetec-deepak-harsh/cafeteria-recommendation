import mysql from 'mysql2/promise';

export let db: mysql.Connection;

export const connectDB = async () => {
    db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Root@123',
        database: 'Cafeteria_recommendation',
        waitForConnections: true,
        connectionLimit: 10, 
    });
    console.log('Database connected');
    return db;
};
export const getDbConnection = () => db;



