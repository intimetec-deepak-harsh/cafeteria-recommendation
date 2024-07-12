import {db} from '../database/connection';
import { Engine } from '../recommendationEngine/engine';
import { FeedbackData } from '../recommendationEngine/Interface/feedbackData';
import { FeedbackService } from './feedbackService';

class RecommendationService {
    private feedbackService: FeedbackService;

    constructor(feedbackService: FeedbackService) {
        this.feedbackService = feedbackService;
    }

    public async getRecommendedFood(category: string) {
        const feedbackData = await this.feedbackService.getFeedbackByCategory(category);
        const feedback = feedbackData.map(row => ({ 
            
            item_Id: row.item_Id,
            foodItem: row.foodItem,
            comment: row.Comment,
            rating: row.Rating
        })) as FeedbackData[];

        const analyzer = new Engine(feedback);
        return analyzer.getTop5ByCombinedAvg();
    }

    public async analyzeRolloutInput(itemId: any) {
        const connection = db;
        if (connection) {
                   
            console.log('Received itemId:', itemId.selectedItemId); 
            const idsArray = itemId.selectedItemId.split(',').map((id: string) => id.trim());
            if (idsArray.length === 0) {
                throw new Error('No item IDs provided.');
            }
            const rawQuery = `SELECT * FROM menuitem WHERE item_Id IN (${idsArray.map((id: any) => `'${id}'`).join(',')})`;
            const [data] = await connection.query(rawQuery);
            this.processRecommendedItems(data);
            console.log(data)
            return data;
        } else {
            throw new Error('No database connection.');
        }
    }

    public async checkIfDataExists( category: string): Promise<boolean> {
        const connection = db;
        const checkQuery = `
            SELECT COUNT(*) as count FROM recommendation 
            WHERE category = ? AND DATE(recommendation_date) = CURDATE()
        `;
        const [rows] = await connection!.execute(checkQuery, [category]);
        const count = (rows as any)[0].count;
        return count > 0;
    }


    public async processRecommendedItems(recommendedItems:any) {
        console.log('check para recommend',recommendedItems);
        console.log('check para recommend2',recommendedItems[0]);
        console.log('check para recommend3',recommendedItems[0].category);
        try {
            const dataExists = await this.checkIfDataExists(recommendedItems[0].item_Id);
            if (dataExists) {
                console.log(`Data for category "${recommendedItems[0].item_Id}" and today is already present.`);
            } else {
                await this.insertRecommendedItems(recommendedItems);
            }
      
            console.log('Operation completed.');
        } catch (error) {
            console.error('Error processing recommended items:', error);
        }
    }
    
    // public async insertRecommendedItems(recommendedItems:any) {
    //     console.log('recommendation data',recommendedItems);
        
    //     const connection = db;
    //     try {
    //         const insertQuery = `
    //         INSERT INTO recommendation(menuitem_id, category, averageRating, recommendation_date, vote)
    //         VALUES (?, ?, ?, NOW(), 0)
    //         `;

    //         console.log('log recommend',recommendedItems);
            
    //         for (const item of recommendedItems) {
    //             console.log('log item',item);
                
    //             await connection!.execute(insertQuery, [
    //                 item.Item_Id,
    //                 item.item_name,
    //                 item.category,
    //                 parseFloat(item.rating),
    //             ]);
    //             console.log(`Inserted item: ${item.ItemName}`);
    //         }
      
    //         console.log('All recommended items inserted successfully.');
    //     } catch (error) {
    //         console.error('Error inserting recommended items:', error);
    //     }
    // }

    public async insertRecommendedItems(recommendedItems: any[]) {
        console.log('Recommendation data:', recommendedItems);
    
        const connection = db;
        try {
            const insertQuery = `
                INSERT INTO recommendation(menuitem_id, category, averageRating,menuName, recommendation_date,averageSentimentScore)
                VALUES (?, ?, ?, ?,NOW(),0)
            `;
    
            for (const item of recommendedItems) {
                console.log('Item details:', item);
    
                const { item_Id, item_name, rating, meal_type } = item;
    
                // Ensure all required properties are present
                // if (item_Id === undefined || item_name === undefined || rating === undefined || meal_type === undefined) {
                //     console.error(`Skipping item due to missing values: ${JSON.stringify(item)}`);
                //     continue;
                // }
    
                // Determine category based on meal_type
                let category: string;
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
    
                const averageRating = parseFloat(rating);
                console.log('Parsed rating:', averageRating);
    
                // Check if the rating is a valid number
                if (isNaN(averageRating)) {
                    console.error(`Skipping item due to invalid rating: ${JSON.stringify(item)}`);
                    continue;
                }
    
                await connection.execute(insertQuery, [
                    item_Id,
                    category,
                    averageRating,
                    item_name
                ]);
    
                console.log(`Inserted item: ${item_name}`);
            }
    
            console.log('All recommended items inserted successfully.');
        } catch (error) {
            console.error('Error inserting recommended items:', error);
        }
    }
    
    
}

export default RecommendationService;