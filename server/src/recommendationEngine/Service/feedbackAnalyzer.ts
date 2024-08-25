import Sentiment = require('sentiment');
import { FeedbackData } from '../Interface/feedbackData';
import { FoodItemStats } from '../Interface/fooditemStats';

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


    public calculateAverages(): FoodItemStats[] {

        const foodItemStats: { [key: string]: { itemId: number,meal_type:number, meal_type_name?: string, totalRating: number, totalSentimentRating: number, count: number } } = {};     
       
        this.feedbackData.forEach(feedback => {
            const { foodItem, rating, comment } = feedback;
            // foodItem = feedback.foodItem
            //destructure()
            if (!foodItemStats[foodItem]) {
                foodItemStats[foodItem] = { itemId: 0, meal_type:0,meal_type_name: '', totalRating: 0, totalSentimentRating: 0, count: 0 };
            }
            foodItemStats[foodItem].itemId = feedback.item_Id;           
            foodItemStats[foodItem].meal_type_name = feedback.meal_type_name;
            foodItemStats[foodItem].meal_type = feedback.meal_type;
            
            // +rating use isliye kiya hai taki agar uska datatype stirng bhi ho to usko number me convert krde
            foodItemStats[foodItem].totalRating += +rating;

            const sentimentScore = this.analyzeComment(comment);
            foodItemStats[foodItem].totalSentimentRating += sentimentScore;
            foodItemStats[foodItem].count++;
        });
//obj map kr k return kr rahe hai 

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
                //toFixed() to show decimal place
                avgRating: +avgRating.toFixed(2),
                avgSentimentRating: +avgSentimentRating.toFixed(2),
                combinedAvg: +combinedAvg.toFixed(2)
            };
        });
    }
}
