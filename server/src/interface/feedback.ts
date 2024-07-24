import { RowDataPacket } from "mysql2";


export  interface FeedbackData extends RowDataPacket {
    rating: number; 
    comment: string; 
    userId?: number;
    item_Id?: number;
    meal_type_name?: string;
    feedbackDate?: Date;
}
