import { RowDataPacket } from "mysql2";

export interface RolloutItem extends RowDataPacket {
    recommendation_id: number;
    menuItem_id: number;
    recommendation_date: string; 
    category: string;
    menuName: string;
}