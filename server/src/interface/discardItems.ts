import { RowDataPacket } from "mysql2";


export  interface DiscardMenuitem extends RowDataPacket {
    rating: number; 
    comment: string; 
    userId?: number;
    item_name:string;
    item_Id?: number;
    feedbackDate?: Date;
}
