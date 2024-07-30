import { db } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';
import { User } from '../interface/user';
import { Role } from '../interface/role';
import { MenuItem } from '../interface/menuItem';
import { MealType } from '../interface/menuItem';
import { ResultSetHeader } from 'mysql2';
import { DiscardMenuitem } from '../interface/discardItems';
import { RolloutItem } from '../interface/rolloutItem';

class UserService {
    public async authenticateUser(email: string, password: string): Promise<User[]> {
        try {
            if (!email || !password) {
                throw new Error('Email and password must be provided');
            }

            const [rows] = await db.execute<User[]>(
                'SELECT * FROM Users WHERE email = ? AND password = ?',
                [email, password]
            );

            if (rows.length === 0) {
                throw new Error('Invalid email or password');
            }

            return rows;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error during authentication: ${error.message}`);
                throw new Error('Authentication failed, please try again later');
            } else {
                console.error('Unexpected error during authentication');
                throw new Error('An unexpected error occurred, please try again later');
            }
        }
    }


   // getRolloutData
    public async getRolloutData(menu_type: string): Promise<RolloutItem[]> {
        console.log('Menu type', menu_type);

        if (!menu_type) {
            throw new Error('Menu Type must be provided');
        }
        const [rows] = await db.execute<RolloutItem[]>(
           'SELECT * FROM recommendation WHERE category = ? AND (DATE(recommendation_date) = CURDATE())',
            [menu_type]
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

    public static async getUsers(): Promise<User[]> {
        const [rows] = await db.execute<User[]>(
            'SELECT * FROM users',          
        );
        return rows;
    }

    public async getDiscardMenu(): Promise<DiscardMenuitem[]> {
        const [rows] = await db.execute<DiscardMenuitem[]>(
        'SELECT a.*, m.* FROM menu_item_audit a INNER JOIN menuitem m ON a.itemId = m.item_Id WHERE a.avgRating < 3 AND a.avgSentimentRating < 3 AND m.is_discard = 0',
        );
        return rows;
    }

    //discard new attempt
    public async getNewDiscardMenu(): Promise<DiscardMenuitem[]> {
        const [rows] = await db.execute<DiscardMenuitem[]>(
        'SELECT  f.feedbackID, f.userId, f.item_Id, m.item_name, f.Comment, f.Rating, f.FeedbackDate  FROM feedback f JOIN  menuitem m ON f.item_Id = m.item_Id WHERE  f.Rating < 3',        
        );
        return rows;
    }

    public async getMenu(): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'SELECT * FROM MenuItem where is_Discard != 1',          
        );
        return rows;
    }

    public async getSpecificMenu(item_Id:number): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'SELECT * FROM MenuItem where item_Id = ?', [item_Id]          
        );
        return rows;
    }

        public async addNewMenuItem(item_name: string, meal_type: string, price: number,availability_status:boolean, dietary_type:number, spice_type:number, cuisine_type:number, sweet_tooth_type:number): Promise<number> {
            if (!item_name || !meal_type || !price || !availability_status || !dietary_type || !spice_type || !cuisine_type || !sweet_tooth_type) {
                throw new Error('Proper data must be provided');
            }
            const [result] =  await db.execute<ResultSetHeader>(
                'INSERT INTO menuitem (item_name, meal_type, price, availability_status, dietary_type, spice_type, cuisine_type,sweet_tooth_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [item_name, meal_type, price, availability_status, dietary_type, spice_type ,cuisine_type,sweet_tooth_type]
            );
            return result.insertId;
        }

    // giveRolloutVote
    public async giveRolloutVote(userID: number,menuId: number,Category: string): Promise<void> {
        const user_Id = userID;
        const menu_Id = menuId;
        const category = Category;
        const currentDate = new Date(); 
       
        if (!user_Id || !menu_Id) {
            throw new Error(' Please Provide proper data');
        }
        try {
            const [result] = await db.execute(
            'INSERT INTO votedfooditem (item_Id,userId,Date,is_voted,category) VALUES (?, ?, ?, ?, ?)',
            [menu_Id, user_Id,currentDate,1,category]
        );
        console.log('User Rollout Voted successfully.');
        }catch (error) {
            console.error('Failed to vote for  menu item:', error);
            throw new Error('Error while voting menu item');
        }
    }

    public async updateExisitingMenuItem(data:any): Promise<void> {
        console.log('show',data)
        if (!data) {
            throw new Error('Item name and Meal Type must be provided');
        }
        try {
            await db.execute(
                'UPDATE menuitem SET item_name = ?, meal_type = ?,  price = ?, availability_status = ? WHERE item_Id = ?',
                [data.item_name, data.meal_type,  data.price, data.availability_status, data.item_Id]
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
            await db.execute('DELETE FROM notification WHERE menu_id = ?',[data.item_Id]);
            await db.execute('DELETE FROM menuitem WHERE item_Id = ?', [data.item_Id]);    
    
            console.log('Menu item Deleted successfully.');
        } catch (error) {
            console.error('Failed to delete menu item:', error);
            throw new Error('Error delete menu item');
        }
    }

    // DiscardMenuItem
    public async DiscardMenuItem(data:any): Promise<void> {
        console.log('show',data)
        if (!data) {
            throw new Error('Item Id must be provided');
        }
        const connection =  db;
        try {
            await connection.execute(
                'UPDATE menuitem SET is_discard = 1 WHERE item_Id = ?',
                [data.item_Id]
            );

             await connection.commit(); // Commit the transaction
          
            console.log('Menu item Discard successfully.');
        } catch (error) {
            await connection.rollback();
            console.error('Failed to discard menu item:', error);
            throw new Error('Error discard menu item');
        }
    }


    public async getFeedback(): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
         'SELECT mi.item_name, u.name AS user_name, f.Comment, f.Rating FROM cafeteria_recommendation.feedback f JOIN cafeteria_recommendation.menuitem mi ON f.item_Id = mi.item_Id JOIN cafeteria_recommendation.users u ON f.userId = u.userId ORDER BY f.Rating DESC LIMIT 10;'
          
        );
        return rows;
    }

    public async giveFeedback(item_Id: number, userId: number,Comment: string,Rating: number,feedbackDate:Date): Promise<void> {
        let user = userId;
        // console.log('come inside',user, item_Id, Comment, Rating, feedbackDate)
        if (!item_Id || !userId || !Comment || !Rating || !feedbackDate) {
            throw new Error('Item name, Feedback, and rating must be provided');
        }
        await db.execute(
            'INSERT INTO feedback (item_Id,userId,Comment,Rating,feedbackDate) VALUES (?, ?, ?, ?, ?)',
            [user,item_Id, Comment,Rating,feedbackDate]
        );
    }


    // updateProfile

    public async updateProfile(user_Id: number, user_dietary_preference: string, user_spice_level: string, user_cuisine_preference: string, user_sweet_tooth: number): Promise<void> {
        const userId = +user_Id;

        console.log('get user Id', userId);
        console.log('come inside', user_Id, user_dietary_preference, user_spice_level, user_cuisine_preference, user_sweet_tooth);
    
        if (!user_Id || !user_dietary_preference || !user_spice_level || !user_cuisine_preference || user_sweet_tooth === undefined) {
            throw new Error('User Preference must be provided');
        }
    
        const result = await db.execute(
            'INSERT INTO preference (user_id, dietary_preference, spice_level, cuisine_preference, sweet_tooth) VALUES (?, ?, ?, ?, ?)',
            [user_Id, user_dietary_preference, user_spice_level, user_cuisine_preference, user_sweet_tooth]
        );
        console.log('update profile',result);
        
    }
   


    public async  updateItemAvailability(data:any): Promise<void> {
        console.log('Data here ', data);
        if (!data) {
            throw new Error('Item Id and Availability must be provided');
        }
        try {
            await db.execute(
                'UPDATE menuitem SET availability_status = ? WHERE item_Id = ?',
                [data.availability_status, data.item_Id]
            );
    
            console.log('Menu Availability updated successfully.');
        } catch (error) {
            console.error('Failed to update menu item availability:', error);
            throw new Error('Error updating menu item availability');
        }
    }

    
    public async getAvailableMenuItems(): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'SELECT * FROM menuitem where availability_status = 1 and is_Discard != 1',          
        );
        return rows;
    }

    public async getMealType(): Promise<MealType[]> {
        const [rows] = await db.execute<MealType[]>(
            'SELECT Distinct meal_type_name FROM meal_type',          
        );
        return rows;
    }

    
}

export default UserService;
