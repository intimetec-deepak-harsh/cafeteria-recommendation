import { db } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';
import { User } from '../interface/user';
import { Role } from '../interface/role';
import { MenuItem } from '../interface/menuItem';
import { FeedbackData } from '../interface/feedback';

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

    public async addNewMenuItem(item_name: string, meal_type: string, rating: string,price: number,availability_status:boolean): Promise<void> {
        if (!item_name || !meal_type || !rating || !price || !availability_status) {
            throw new Error('Item name, Meal Type, and rating must be provided');
        }
        await db.execute(
            'INSERT INTO menuitem (item_name, meal_type, rating, price, availability_status) VALUES (?, ?, ?, ?, ?)',
            [item_name, meal_type, rating, price, availability_status]
        );
    }


    public async updateExisitingMenuItem(data:any): Promise<void> {
        console.log('show',data)
        if (!data) {
            throw new Error('Item name, Meal Type, and rating must be provided');
        }
        try {
            await db.execute(
                'UPDATE menuitem SET item_name = ?, meal_type = ?, rating = ?, price = ?, availability_status = ? WHERE item_Id = ?',
                [data.item_name, data.meal_type, data.rating, data.price, data.availability_status, data.item_Id]
            );
    
            console.log('Menu item updated successfully.');
        } catch (error) {
            console.error('Failed to update menu item:', error);
            throw new Error('Error updating menu item');
        }
    }

    public async deleteExisitingMenuItem(data:any): Promise<void> {
        console.log('show',data)
        if (!data) {
            throw new Error('Item Id must be provided');
        }
        try {
            await db.execute(
                'DELETE FROM menuitem WHERE item_Id = ?',
                [data.item_Id]
            );    
    
            console.log('Menu item Deleted successfully.');
        } catch (error) {
            console.error('Failed to delete menu item:', error);
            throw new Error('Error delete menu item');
        }
    }


    public async getFeedback(): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'select * from feedback order by rating desc',
        );
        return rows;
    }

    public async giveFeedback(item_Id: string, userId: string,Comment: string,Rating: string,feedbackDate:Date): Promise<void> {
        console.log('come inside')
        if (!item_Id || !userId || !Comment || !Rating || !feedbackDate) {
            throw new Error('Item name, Feedback, and rating must be provided');
        }
        await db.execute(
            'INSERT INTO feedback (userId,item_Id,Comment,Rating,feedbackDate) VALUES (?, ?, ?, ?, ?)',
            [userId,item_Id, Comment,Rating,feedbackDate]
        );
    }
}

export default UserService;