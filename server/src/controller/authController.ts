import { db } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';
import { User } from '../interface/user';
import { Role } from '../interface/role';
import { MenuItem } from '../interface/menuItem';
// import { FeedbackData } from '../interface/feedback';



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
         'SELECT  mi.item_name, u.name AS user_name, f.Comment, f.Rating FROM  cafeteria_recommendation.feedback f JOIN cafeteria_recommendation.menuitem mi ON f.item_Id = mi.item_Id JOIN cafeteria_recommendation.users u ON f.userId = u.userId ORDER BY f.rating DESC;'
          
        );
        return rows;
    }

    public async giveFeedback(item_Id: number, userId: number,Comment: string,Rating: number,feedbackDate:Date): Promise<void> {
        const user = +userId;
        console.log('come inside',user, item_Id, Comment, Rating, feedbackDate)
        if (!item_Id || !userId || !Comment || !Rating || !feedbackDate) {
            throw new Error('Item name, Feedback, and rating must be provided');
        }
        await db.execute(
            'INSERT INTO feedback (item_Id,userId,Comment,Rating,feedbackDate) VALUES (?, ?, ?, ?, ?)',
            [user,item_Id, Comment,Rating,feedbackDate]
        );
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
            'SELECT * FROM menuitem where availability_status = 1',          
        );
        return rows;
    }

    public async getMealType(): Promise<MenuItem[]> {
        const [rows] = await db.execute<MenuItem[]>(
            'SELECT Distinct meal_type FROM menuitem',          
        );
        return rows;
    }

    // public async createRecommendation(req: Request, res: Response) {
    //     const { menuItemId } = req.body;
    
    //     try {
    //       const recommendation = await recommendationService.generateRecommendation(menuItemId);
    //       res.status(201).json({ recommendation });
    //     } catch (error) {
    //       res.status(500).json({ error: error.message });
    //     }
    //   }
    
    //   public async getRecommendations(req: Request, res: Response) {
    //     try {
    //       const recommendations = await recommendationService.getRecommendations();
    //       res.status(200).json({ recommendations });
    //     } catch (error) {
    //       res.status(500).json({ error: error.message });
    //     }
    //   }

    // public async getRecommendations(): Promise<Recommendation[]> {
    //     const [rows] = await db.execute<Recommendation[]>(
    //         'SELECT * FROM Recommendation'
    //     );
    //     return rows;
    // }

//    public async generateRecommendation(menuItemId: number): Promise<Recommendation> {
//         try {
//             const { averageRating, averageSentimentScore } = await SentimentAnalysisService.calculateAverageSentiment(menuItemId);
//             console.log(averageRating, averageSentimentScore);

//             const [rows] = await db.query<Recommendation[]>(
//                 'INSERT INTO recommendations (menuItem_id, averageRating, averageSentimentScore, recommendation_date) VALUES (?, ?, ?, NOW())',
//                 [menuItemId, averageRating, averageSentimentScore]
//             );
//             console.log(rows);
//             db.end(); // Close the connection

//             return rows[0];
//         } catch (error) {
//             console.error('Error generating recommendation:', error);
//             throw error;
//         }
//     }

//     public async getRecommendations(): Promise<Recommendation[]> {
//         try {
//             const [rows] = await db.query<Recommendation[]>(
//                 'SELECT * FROM recommendations'
//             );

//             db.end(); // Close the connection

//             return rows;
//         } catch (error) {
//             console.error('Error fetching recommendations:', error);
//             throw error;
//         }
//     }


}

export default UserService;



//----------------------
//(no of rating / total number of person + sentiments score / total number of person)   / 2

//ex: menuitem : 5 ( fries)
//10 users ( average of rating)