import {db} from '../database/connection';
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

        console.log('get category details',category);
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

            //calculate feedback data and calculate average
            
            this.processRecommendedItems(data);
            console.log('show recommend',data)
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

        try {
            const dataExists = await this.checkIfDataExists(recommendedItems[0].item_Id);
            if (dataExists) {
                console.log(`Data for category "${recommendedItems[0].item_Id}" and today is already present.`);
            } else {
                await this.insertRecommendedItems(recommendedItems);;
            }
      
            console.log('Operation completed.');
        } catch (error) {
            console.error('Error processing recommended items:', error);
        }
    }

    public async insertRecommendedItems(recommendedItems: any[]) {
        console.log('Recommendation data:', recommendedItems);
    
        const connection = db;
        try {
            const insertQuery = `
                INSERT INTO recommendation(menuitem_id, category,menuName, recommendation_date)
                VALUES (?, ?, ?,NOW())
            `;
    
            for (const item of recommendedItems) {
                console.log('Item details:', item);
    
                const { item_Id, item_name, meal_type } = item;
    
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

                await connection.execute(insertQuery, [
                    item_Id,
                    category,
                    item_name
                ]);
    
                console.log(`Inserted item: ${item_name}`);

                const menuId = item_Id;   
                console.log('recommended foodlist',menuId);
                
               const type = 'recommendation';
               const message = `Rollout food for '${category}' has been added for the vote.`;

               await NotificationService.addNotification(type, message, menuId);
              console.log('Notification added successfully for the recommendationss.')
            }
    
            console.log('All recommended items inserted successfully.');
        } catch (error) {
            console.error('Error inserting recommended items:', error);
        }
    }
    
    
}

export default RecommendationService;