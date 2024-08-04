import { RowDataPacket } from 'mysql2/promise';
// import MySQLConnection from '../database/mySQLConnection';
import { db } from '../database/connection';
import { FeedbackData } from '../interface/feedback';
import { MonthlyFeedbackReport } from '../interface/MonthlyFeedbackReport';

export class FeedbackService {


    public async getAllFeedback(): Promise<FeedbackData[]> {
         const connection = db;
        if (connection) {
            const query = 'SELECT f.*, m.item_name FROM feedback f JOIN menuItem m ON f.item_Id = m.item_Id';
            const [rows] = await db.execute<FeedbackData[]>(query);
            return rows;
        } else {
            throw new Error('No database connection.');
        }
    }

    public async getAllItemFeedback(): Promise<FeedbackData[]> {
        const connection = db;
       if (connection) {
           const query = 'SELECT  f.*, m.item_name,mt.meal_type_name,mt.id as meal_type FROM feedback f JOIN menuItem m ON f.item_Id = m.item_Id JOIN meal_type mt ON m.meal_type = mt.id;';
           const [rows] = await db.execute<FeedbackData[]>(query);
           return rows;
       } else {
           throw new Error('No database connection.');
       }
   }

    public async getFeedbackByCategory(category: string): Promise<FeedbackData[]> {  
        const connection = db;
        if (connection) {
            const query = `SELECT f.item_Id, m.item_name AS foodItem,mt.id, mt.meal_type_name,f.Comment, f.Rating 
            FROM feedback f JOIN menuitem m ON f.item_Id = m.item_Id JOIN meal_type mt ON m.meal_type = mt.id 
            WHERE mt.meal_type_name = ? AND m.is_discard = 0;`;      
            const [rows] = await connection.execute<FeedbackData[]>(query, [category]);
              
            return rows;
        } else {
            throw new Error('No database connection.');
        }
    }

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


//get all feedback data for monthly report

public async getFeedbackMonthlyReport(startDate: string, endDate: string) {
    const query = `
        SELECT 
            m.item_Id AS menu_id, 
            IFNULL(r.recommendation_id, 0) AS recommendation_id,
            IFNULL(AVG(f.Rating), 0) AS average_rating, 
            COUNT(f.feedbackID) AS total_feedbacks, 
            IFNULL(GROUP_CONCAT(f.Comment SEPARATOR ', '), 'No comments') AS comments
        FROM 
            menuitem m
        LEFT JOIN 
            feedback f ON m.item_Id = f.item_Id AND f.FeedbackDate BETWEEN ? AND ?
        LEFT JOIN 
            recommendation r ON m.item_Id = r.menuItem_id AND r.recommendation_date BETWEEN ? AND ?
        GROUP BY 
            m.item_Id, 
            r.recommendation_id
    `;

    const [rows] = await db.execute(query, [startDate, endDate, startDate, endDate]);
    return rows;
}


    // addDetailFeedbackQuestions
    public async addDetailFeedbackQuestions(itemId: number, questions:string[]): Promise<string> {
        const connection = db;
        if (connection) {
            const checkQuery = `SELECT COUNT(*) as count FROM discardmenufeedback WHERE menu_id = ?`;
            const [rows]: [RowDataPacket[], any] = await connection.execute(checkQuery, [itemId]);
            const count = rows[0].count;

            if (count > 0) {
                return 'Menu ID already exists, no need to insert again';
            }
            const query = `INSERT INTO discardmenufeedback (question, menu_id) VALUES (?, ?)`;
            const promises = questions.map(question => connection.execute(query, [question, itemId]));
            await Promise.all(promises);
            return 'Data inserted';
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
            const checkQuery = `SELECT v.*, m.item_name, COUNT(v.is_voted) AS vote_count
            FROM votedfooditem v
            JOIN menuitem m ON v.item_Id = m.item_Id
            WHERE v.category = ? AND DATE(v.Date) = CURDATE()
            GROUP BY v.item_Id, m.item_name, v.Id, v.userId, v.Date, v.is_voted, v.category;`;
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