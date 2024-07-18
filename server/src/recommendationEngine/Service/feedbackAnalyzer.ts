import Sentiment = require('sentiment');
import { FeedbackData } from '../Interface/feedbackData';
// import { FoodItemStats } from '../Interface/fooditemStats'

export default class FeedbackAnalyzer {
    private feedbackData: FeedbackData[];
    private sentimentAnalyzer: Sentiment;

    constructor(feedbackData: FeedbackData[]) {
        this.feedbackData = feedbackData;
        this.sentimentAnalyzer = new Sentiment();
    }

    private analyzeComment(comment: string): number {
        // console.log('comment list',comment);
        
        const result = this.sentimentAnalyzer.analyze(comment);
        // console.log('sentiment result',result);
        
        return result.score;
    }
///////////////////////////
    private  analyzeRating(rating: number): number {
        return (rating - 3) * 2 / 2; // Normalize the rating to a sentiment score
    }
///////////////////////////////
    public calculateAverages(): FoodItemStats[] {
        const foodItemStats: { [key: string]: { itemId: number, totalRating: number, totalSentimentRating: number, count: number } } = {};

        this.feedbackData.forEach(feedback => {
            const { foodItem, rating, comment } = feedback;
            if (!foodItemStats[foodItem]) {
                foodItemStats[foodItem] = { itemId: 0, totalRating: 0, totalSentimentRating: 0, count: 0 };
            }
            foodItemStats[foodItem].itemId = feedback.item_Id;
            foodItemStats[foodItem].totalRating += +rating;
            
            const sentimentScore = this.analyzeComment(comment);
            foodItemStats[foodItem].totalSentimentRating += sentimentScore;
            foodItemStats[foodItem].count++;
        });

        return Object.keys(foodItemStats).map(foodItem => {
            const { itemId, totalRating, totalSentimentRating, count } = foodItemStats[foodItem];            
            const avgRating = totalRating / count;
            const avgSentimentRating = totalSentimentRating / count;
            let combinedAvg = (avgRating + avgSentimentRating) / 2;

            return {
                foodItem,
                itemId,
                avgRating: +avgRating.toFixed(2),
                avgSentimentRating: +avgSentimentRating.toFixed(2),
                combinedAvg: +combinedAvg.toFixed(2)
            };
        });
    }
}


interface FoodItemStats {
    foodItem: string;
    itemId: number;
    avgRating: number;
    avgSentimentRating: number;
    combinedAvg: number;
}