import { RowDataPacket } from 'mysql2/promise';
// import MySQLConnection from '../database/mySQLConnection';
import { db } from '../database/connection';
import { FeedbackData } from '../interface/feedback';

export class FeedbackService {


    public async getAllFeedback(): Promise<FeedbackData[]> {
         const connection = db;
        if (connection) {
            const query = 'SELECT f.*, m.ItemName FROM feedback f JOIN menuItem m ON f.itemId = m.itemId';
            const [rows] = await db.execute<FeedbackData[]>(query);
            return rows;
        } else {
            throw new Error('No database connection.');
        }
    }

    public async getFeedbackByCategory(category: string): Promise<FeedbackData[]> {  
        const connection = db;
        if (connection) {
            const query = `
            SELECT f.item_Id, m.item_name AS foodItem, f.Comment, f.Rating 
            FROM feedback f 
            JOIN menuitem m ON f.item_Id = m.item_Id 
            JOIN meal_type mt ON m.meal_type = mt.id 
            WHERE mt.meal_type_name = ?
            `;
            console.log('Query:', query);
            console.log('Category:', category);
            
            const [rows] = await connection.execute<FeedbackData[]>(query, [category]);
            
            console.log('Rows:', rows);
            
            return rows;
        } else {
            throw new Error('No database connection.');
        }
    }

    public async insertUserFeedback(feedback: any) {
        const connection = db;
        if(connection) {
            const query = `INSERT INTO feedback (userId, itemId, rating, comment, date) VALUES
                            (?, ?, ?, ?, Now())`;
            await connection.execute(query,[feedback.userId, feedback.itemId, feedback.rating, feedback.comment]);
            return 'Data inserted'
        } else {
            throw new Error('No database connection.')
        }
    }

    public async viewEmployeeVotes(item:any){
        console.log(item.category);
        const connection = db;
        if(connection){
            const checkQuery = `
                SELECT * FROM recommendedItem 
                WHERE category = ? AND DATE(rolloutDate) = CURDATE()
            `;
            const [rows] = await connection!.execute(checkQuery, [item.category]);
            console.log(rows);
            return rows;
        }
    }
}