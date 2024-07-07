import { FoodItemStats } from '../Interface/fooditemStats';

export class FeedbackHandler {
    public sortByOverallAvg(foodItemStats: FoodItemStats[]): FoodItemStats[] {
        return foodItemStats.sort((a, b) => b.combinedAvg - a.combinedAvg);
    }

    public getTopOverallAvg(foodItemStats: FoodItemStats[]): FoodItemStats[] {
        return this.sortByOverallAvg(foodItemStats).slice(0, 5);
    }
}