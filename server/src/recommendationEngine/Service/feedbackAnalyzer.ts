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
        console.log('comment list',comment);
        
        const result = this.sentimentAnalyzer.analyze(comment);
        console.log('sentiment result',result);
        
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
            foodItemStats[foodItem].totalRating = +foodItemStats[foodItem].totalRating + +rating;
            console.log('total Rzte',foodItemStats[foodItem].totalRating );
            
            const sentimentScore = this.analyzeComment(comment);
            foodItemStats[foodItem].totalSentimentRating += sentimentScore;
            foodItemStats[foodItem].count++;
        });

        return Object.keys(foodItemStats).map(foodItem => {
            const itemId = foodItemStats[foodItem].itemId;
            const { totalRating, totalSentimentRating, count } = foodItemStats[foodItem];
            console.log('show count',count);
            
            const avgRating = totalRating / count;
            console.log('total', totalRating);
            console.log('Average Rating calculation', avgRating);
            
            const avgSentimentRating = totalSentimentRating / count;
            console.log('total sentiment', totalSentimentRating);
            console.log('Average sentiment rating', avgSentimentRating);

            const combinedAvg = (avgRating + avgSentimentRating) / 2;
            console.log('Average sentiment rating', avgSentimentRating);
            console.log('Average rating', avgRating);
            console.log('Combine Avg', combinedAvg);


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