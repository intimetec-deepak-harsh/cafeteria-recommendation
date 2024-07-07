import Sentiment = require('sentiment');
import { FeedbackData } from '../Interface/feedbackData';
import { FoodItemStats } from '../Interface/fooditemStats'

export class FeedbackAnalyzer {
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

    public calculateAverages(): FoodItemStats[] {
        const foodItemStats: { [key: string]: { itemId: number, totalRating: number, totalSentimentRating: number, count: number } } = {};

        this.feedbackData.forEach(feedback => {
            const { foodItem, rating, comment } = feedback;
            if (!foodItemStats[foodItem]) {
                foodItemStats[foodItem] = { itemId: 0, totalRating: 0, totalSentimentRating: 0, count: 0 };
            }
            foodItemStats[foodItem].itemId = feedback.item_Id;
            foodItemStats[foodItem].totalRating = +foodItemStats[foodItem].totalRating + +rating;
            const sentimentScore = this.analyzeComment(comment);
            foodItemStats[foodItem].totalSentimentRating += sentimentScore;
            foodItemStats[foodItem].count++;
        });

        return Object.keys(foodItemStats).map(foodItem => {
            const itemId = foodItemStats[foodItem].itemId;
            const { totalRating, totalSentimentRating, count } = foodItemStats[foodItem];
            const avgRating = totalRating / count;
            const avgSentimentRating = totalSentimentRating / count;
            const combinedAvg = (avgRating + avgSentimentRating) / 2;

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