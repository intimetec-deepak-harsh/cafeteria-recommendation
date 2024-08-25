import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Log } from "../interface/log";
import { db } from '../database/connection';

class LogService {
 static async insertIntoLog(action: string,id: number): Promise<ResultSetHeader> {
    try {
        const logData = {
        user_id: id,
        action: action,
        };

        
    const [result] = await db.execute<ResultSetHeader>(
        'INSERT INTO log (user_id, action, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [logData.user_id, logData.action]
      );

    return result;
    }catch (error) {
        console.error('Error inserting into log:', error);
        throw error;
      }
  }

   async getLog(): Promise<Log[]> {
    try {    
    const [result] = await db.query<(Log & RowDataPacket)[]>(
        'SELECT * FROM log ORDER BY timestamp DESC LIMIT 10'
      );

    return result;
    }catch (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
  }
}

export default LogService;