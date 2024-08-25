import { RowDataPacket } from "mysql2";


export interface FeedbackQuestionsData extends RowDataPacket {
    itemId: number;
    itemName: string;
    questions: string[];
}