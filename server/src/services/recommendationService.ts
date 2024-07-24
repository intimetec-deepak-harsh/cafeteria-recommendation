import { db } from '../database/connection';
import { Engine } from '../recommendationEngine/engine';
import { FeedbackData } from '../recommendationEngine/Interface/feedbackData';
import { FeedbackService } from './feedbackService';
import NotificationService from './notificationService';

class RecommendationService {
    private feedbackService: FeedbackService;

    constructor(feedbackService: FeedbackService) {
        this.feedbackService = feedbackService;
    }

    public async getRecommendedFood(category: string) {
        const feedbackData = await this.feedbackService.getFeedbackByCategory(category);
        console.log('get feedback data', feedbackData);

        const feedback = feedbackData.map(row => ({
            item_Id: row.item_Id,
            foodItem: row.foodItem,
            meal_type_name: row.meal_type_name,
            comment: row.Comment,
            rating: row.Rating
        })) as FeedbackData[];

        console.log('fetch feedback', feedback);

        const analyzer = new Engine(feedback);
        return analyzer.getTop5ByCombinedAvg();
    }

    public async getRolloutRecommendedFood(feedbackData: FeedbackData[]) {
        const feedback = feedbackData.map(row => ({
            item_Id: row.item_Id,
            foodItem: row.foodItem,
            comment: row.comment,
            rating: row.rating,
            meal_type: row.meal_type
        })) as FeedbackData[];
 
        const analyzer = new Engine(feedback);
        return analyzer.getTop5ByCombinedAvg();
    }

    public async analyzeRolloutInput(itemId: any) {
        const connection = db;
        if (!connection) {
            throw new Error('No database connection.');
        }
    
        const idsArray = itemId.selectedItemId.split(',').map((id: string) => id.trim());
        if (idsArray.length === 0) {
            throw new Error('No item IDs provided.');
        }
    
        try {
            const getAllMenuData = await this.feedbackService.getFeedbackByMenuItemId(idsArray);
            console.log('get all menu data', getAllMenuData);
    
            const transformedData = getAllMenuData
                .map(row => ({
                    item_Id: row.item_Id,
                    meal_type: this.convertMealType(row.mealType), // Convert meal type here
                    foodItem: row.foodItem,
                    comment: row.Comment,
                    rating: row.Rating,
                }))
                .filter((row): row is FeedbackData =>
                    row.item_Id !== undefined &&
                    row.meal_type !== undefined &&
                    row.foodItem !== undefined &&
                    row.comment !== undefined &&
                    row.rating !== undefined
                );
       
            const rolloutRecommendedFood = await this.getRolloutRecommendedFood(transformedData);   
            const checkData = await this.processRecommendedItems(rolloutRecommendedFood);
            return checkData;

            
        } catch (error) {
            console.error('Error during data analysis:', error);
            throw new Error('Error during data analysis.');
        }
    }
    

    private convertMealType(mealType: string): number {
        switch (mealType.toLowerCase()) {
            case 'breakfast':
                return 1;
            case 'lunch':
                return 2;
            case 'dinner':
                return 3;
            default:
                throw new Error(`Invalid meal type: ${mealType}`);
        }
    }

    public async checkIfDataExists(category: string): Promise<boolean> {
        const connection = db;
        const checkQuery = `
            SELECT COUNT(*) as count FROM recommendation 
            WHERE category = ? AND DATE(recommendation_date) = CURDATE()
        `;
        const [rows] = await connection!.execute(checkQuery, [category]);
        const count = (rows as any)[0].count;
        return count > 0;
    }

    public async processRecommendedItems(recommendedItems: any) {
        try {
            const dataExists = await this.checkIfDataExists(recommendedItems[0].itemId);
            if (dataExists) {
                console.log(`Data for category "${recommendedItems[0].item_Id}" and today is already present.`);
            } else {
                await this.insertRecommendedItems(recommendedItems);
                return recommendedItems;
            }
        } catch (error) {
            console.error('Error processing recommended items:', error);
        }
    }

    public async insertRecommendedItems(recommendedItems: any[]) {  
        const connection = db;
        if (!connection) {
            console.error('No database connection.');
            return;
        }
    
        try {
            const insertQuery = `
                INSERT INTO recommendation(menuitem_id, recommendation_date, category, menuName, rating, sentimentscore)
                VALUES (?, NOW(), ?, ?, ?, ?)
            `;
    
            for (const item of recommendedItems) {
                const { itemId, foodItem, meal_type, avgRating, avgSentimentRating } = item;
    
                if ([itemId, foodItem, meal_type, avgRating, avgSentimentRating].includes(undefined)) {
                    console.error('Skipping item due to missing required fields:', JSON.stringify(item));
                    continue;
                }
    
                let category = '';
                switch (meal_type) {
                    case 1:
                        category = 'Breakfast';
                        break;
                    case 2:
                        category = 'Lunch';
                        break;
                    case 3:
                        category = 'Dinner';
                        break;
                    default:
                        console.error(`Invalid meal_type for item: ${JSON.stringify(item)}`);
                        continue;
                }
    
                try {
                    await connection.execute(insertQuery, [
                        itemId, // Updated to match the database column
                        category,
                        foodItem, // Updated to match the database column
                        avgRating, // Updated to match the database column
                        avgSentimentRating // Updated to match the database column
                    ]);
    
                    const menuId = itemId;
                    console.log('Recommended food item ID:', menuId);
    
                    const type = 'recommendation';
                    const message = `Rollout food for '${category}' has been added for the vote.`;
                    await NotificationService.addNotification(type, message, menuId);
                    console.log('Notification added successfully for the recommendations.');
                } catch (insertError) {
                    console.error('Error inserting recommended item:', insertError);
                }
            }
        } catch (error) {
            console.error('Error inserting recommended items:', error);
        }
    }
    
    
}

export default RecommendationService;
