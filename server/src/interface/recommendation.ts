import { RowDataPacket } from "mysql2";

export interface Recommendation  extends RowDataPacket {
    recommendation_id: number;
    menuItem_id: number;
    averageRating: number;
    averageSentimentScore: number;
    recommendation_date: Date;
  }

export type MealType = "breakfast" | "lunch" | "dinner";
