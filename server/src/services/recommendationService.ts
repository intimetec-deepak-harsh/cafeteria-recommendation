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
            const rawQuery = `SELECT * FROM MenuItem WHERE itemId IN (${idsArray.map((id: any) => `'${id}'`).join(',')})`;
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
            SELECT COUNT(*) as count FROM recommendedItem 
            WHERE category = ? AND DATE(rolloutDate) = CURDATE()
        `;
        const [rows] = await connection!.execute(checkQuery, [category]);
        const count = (rows as any)[0].count;
        return count > 0;
    }


    public async processRecommendedItems(recommendedItems:any) {
        console.log(recommendedItems[0].category);
        try {
            const dataExists = await this.checkIfDataExists(recommendedItems[0].category);
            if (dataExists) {
                console.log(`Data for category "${recommendedItems[0].category}" and today is already present.`);
            } else {
                await this.insertRecommendedItems(recommendedItems);
            }
      
            console.log('Operation completed.');
        } catch (error) {
            console.error('Error processing recommended items:', error);
        }
    }
    
    public async insertRecommendedItems(recommendedItems:any) {
        const connection = db;
        try {
            const insertQuery = `
            INSERT INTO recommendedItem (itemId, itemName, category, rating, rolloutDate, vote)
            VALUES (?, ?, ?, ?, NOW(), 0)
            `;
            for (const item of recommendedItems) {
                await connection!.execute(insertQuery, [
                    item.ItemId,
                    item.ItemName,
                    item.category,
                    parseFloat(item.rating),
                ]);
                console.log(`Inserted item: ${item.ItemName}`);
            }
      
            console.log('All recommended items inserted successfully.');
        } catch (error) {
            console.error('Error inserting recommended items:', error);
        }
    }
}

export default RecommendationService;