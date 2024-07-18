import { RowDataPacket } from "mysql2";

export interface userVote extends RowDataPacket {
    id: number; 
    item_Id: number; 
    userId: number; 
    date: Date; 
    is_voted?: number; 
}