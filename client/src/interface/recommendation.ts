
export interface Recommendation {
    recommendation_id: number;
    menuItem_id: number;
    averageRating: number;
    averageSentimentScore: number;
    recommendation_date: Date;
  }

  export type MealType = "breakfast" | "lunch" | "dinner";
