import { RowDataPacket } from "mysql2";


export default interface FeedbackData extends RowDataPacket {
    rating: number; 
    comment: string; 
    userId: number;
    item_Id: number;
    feedbackDate: Date;
}
