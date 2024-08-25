import { RowDataPacket } from "mysql2";

export interface MonthlyFeedbackReport  extends RowDataPacket {
    report_id: number;
    report_type: "monthlyFeedback";
    generated_date: Date;
    menu_id: number;
    recommendation_id: number;
    average_rating: number;
    total_feedbacks: number;
    comments: string;
  }
