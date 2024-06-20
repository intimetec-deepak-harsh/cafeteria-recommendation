import { db } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';

interface User extends RowDataPacket {
    id: number;
    name: string;
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
    availability_status: boolean;
    meal_type: string;
    price: number;
    rating: number;
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

    public async getMenu(): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'SELECT * FROM MenuItem',          
        );
        return rows;
    }

    public async addNewMenuItem(itemName: string, meal_type: string, rating: string,price: number,availability_status:boolean): Promise<void> {
        if (!itemName || !meal_type || !rating || !price || !availability_status) {
            throw new Error('Item name, Meal Type, and rating must be provided');
        }
        await db.execute(
            'INSERT INTO menuitem (itemName, meal_type, rating, price, availability_status) VALUES (?, ?, ?, ?, ?)',
            [itemName, meal_type, rating, price, availability_status]
        );
    }
}

export default UserService;