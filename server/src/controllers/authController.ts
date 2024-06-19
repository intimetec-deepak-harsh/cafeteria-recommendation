import { db } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';

interface User extends RowDataPacket {
    id: number;
    email: string;
    password: string;
    roleId: number; // Ensure this matches your database schema
}

interface Role extends RowDataPacket {
    role: string;
}

interface MenuItem extends RowDataPacket {
    itemId: number;
    itemName: string;
    category: string;
    rating: number
}

class UserService {
    public async authenticateUser(email: string, password: string): Promise<User[]> {
        if (!email || !password) {
            throw new Error('Email and password must be provided');
        }
        const [rows] = await db.execute<User[]>(
            'SELECT * FROM Users WHERE email = ? AND password = ?',
            [email, password]
        );
        return rows;
    }

    public async getUserRole(userId: number): Promise<Role[]> {
        if (!userId) {
            throw new Error('User ID must be provided');
        }
        const [rows] = await db.execute<Role[]>(
            'SELECT role FROM role WHERE roleid = ?',
            [userId]
        );
        return rows;
    }

    //Anushka
    // public async getMenu(roleID: string): Promise<Role[]> {
    //     console.log('getMenu Functoion called')
    //     const [rows] = await db.execute<Role[]>(
    //         'SELECT * FROM MenuItem',
    //         [roleID]
    //     );
    //     return rows;
    // }

    public async getMenu(roleID: string): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'SELECT * FROM MenuItem',
            [roleID]
        );
        return rows;
    }
}

export default UserService;
