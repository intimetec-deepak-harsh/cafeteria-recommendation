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
            SELECT f.item_Id, m.item_name AS foodItem, mt.meal_type_name,f.Comment, f.Rating 
            FROM feedback f 
            JOIN menuitem m ON f.item_Id = m.item_Id 
            JOIN meal_type mt ON m.meal_type = mt.id 
            WHERE mt.meal_type_name = ?
            `;      
            const [rows] = await connection.execute<FeedbackData[]>(query, [category]);
              
            return rows;
        } else {
            throw new Error('No database connection.');
        }
    }

    //get feedback by menu item id
    public async getFeedbackByMenuItemId(idsArray: string[]): Promise<FeedbackData[]> {  

        const connection = db;
        if (connection) {
            const placeholders = idsArray.map(() => '?').join(', ');
            console.log('placeholder',placeholders);
            
            const query = `
            SELECT f.item_Id, m.item_name AS foodItem, m.price, m.availability_status, m.meal_type,
             mt.meal_type_name AS mealType, f.Comment, f.Rating FROM feedback f JOIN menuitem m ON f.item_Id = m.item_Id 
            JOIN meal_type mt ON m.meal_type = mt.id WHERE m.item_Id IN (${placeholders})`;      
            const [rows] = await connection.execute<FeedbackData[]>(query, idsArray);
            console.log(rows);
           
            return rows;
            
        } else {
            throw new Error('No database connection.');
        }
    }

//feedback data from the rollout ids
public async getFeedbackByIds(idsArray: string[]): Promise<FeedbackData[]> {  
    const connection = db;
    if (connection) {
        const placeholders = idsArray.map(() => '?').join(', ');
        const rawQuery = `SELECT * FROM feedback WHERE item_Id IN (${placeholders})`;
        
        const [rows] = await connection.execute<FeedbackData[]>(rawQuery, idsArray);
        
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

    public async viewEmployeeVotes(item:any): Promise<RowDataPacket[] | { message: string }> {
        console.log('show para item',item);        
        const connection = db;
        if(connection){
            const checkQuery = `SELECT * FROM votedfooditem WHERE category = ? AND DATE = CURDATE()`;
            const [rows] = await connection.execute<RowDataPacket[]>(checkQuery, [item]);
           
            if (rows.length === 0) {
                console.log('No data available for today');
                return { message: 'No data available for today' };
            } else {
                console.log(rows);
                return rows;
            }  
            

        }else {
            throw new Error('No database connection.');
        }
    }
}

export default FeedbackService;