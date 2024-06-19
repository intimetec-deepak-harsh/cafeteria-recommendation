import { db } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';

interface User extends RowDataPacket {
    id: number;
    email: string;
    password: string;
}

interface Role extends RowDataPacket {
    role: string;
}

export const authenticateUser = async (email: string, password: string): Promise<User[]> => {
    const [rows] = await db.execute<User[]>(
        'SELECT * FROM Users WHERE email = ? AND password = ?',
        [email, password]
    );
    return rows;
};

export const getUserRole = async (userId: number): Promise<Role[]> => {
    const [rows] = await db.execute<Role[]>(
        'SELECT role FROM role WHERE roleid = ?',
        [userId]
    );
    return rows;
};
