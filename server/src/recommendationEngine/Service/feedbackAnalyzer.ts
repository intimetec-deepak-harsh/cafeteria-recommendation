import Sentiment = require('sentiment');
import { FeedbackData } from '../Interface/feedbackData';
import { FoodItemStats } from '../Interface/fooditemStats'; // Make sure to import the correct interface

export default class FeedbackAnalyzer {
    private feedbackData: FeedbackData[];
    private sentimentAnalyzer: Sentiment;

    constructor(feedbackData: FeedbackData[]) {
        this.feedbackData = feedbackData;
        this.sentimentAnalyzer = new Sentiment();
    }

    private analyzeComment(comment: string): number {        
        const result = this.sentimentAnalyzer.analyze(comment);
        return result.score;
    }

    private analyzeRating(rating: number): number {
        return (rating - 3) * 2 / 2; // Normalize the rating to a sentiment score
    }


    public calculateAverages(): FoodItemStats[] {

        const foodItemStats: { [key: string]: { itemId: number,meal_type:number, meal_type_name?: string, totalRating: number, totalSentimentRating: number, count: number } } = {};     
       
        this.feedbackData.forEach(feedback => {
            const { foodItem, rating, comment,meal_type_name,meal_type } = feedback;
            if (!foodItemStats[foodItem]) {
                foodItemStats[foodItem] = { itemId: 0, meal_type:0,meal_type_name: '', totalRating: 0, totalSentimentRating: 0, count: 0 };
            }
            foodItemStats[foodItem].itemId = feedback.item_Id;           
            foodItemStats[foodItem].meal_type_name = feedback.meal_type_name;
            foodItemStats[foodItem].meal_type = feedback.meal_type; 
            foodItemStats[foodItem].totalRating += +rating;

            const sentimentScore = this.analyzeComment(comment);
            foodItemStats[foodItem].totalSentimentRating += sentimentScore;
            foodItemStats[foodItem].count++;
        });

        return Object.keys(foodItemStats).map(foodItem => {
            const { itemId, meal_type_name, meal_type, totalRating, totalSentimentRating, count } = foodItemStats[foodItem];
            
            const avgRating = totalRating / count;
            const avgSentimentRating = totalSentimentRating / count;
            let combinedAvg = (avgRating + avgSentimentRating) / 2;

            return {
                foodItem,
                itemId,
                meal_type_name, 
                meal_type,
                avgRating: +avgRating.toFixed(2),
                avgSentimentRating: +avgSentimentRating.toFixed(2),
                combinedAvg: +combinedAvg.toFixed(2)
            };
        });
    }
}
