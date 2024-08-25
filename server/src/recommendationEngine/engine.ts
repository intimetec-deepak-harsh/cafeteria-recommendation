import { FeedbackData } from '../recommendationEngine/Interface/feedbackData';
import { FoodItemStats } from '../recommendationEngine/Interface/fooditemStats';
import  FeedbackAnalyzer  from '../recommendationEngine/Service/feedbackAnalyzer';
import { FeedbackHandler } from '../recommendationEngine/Service/feedbackHandler';

export class Engine {
    private feedbackData: FeedbackData[];
    private feedbackCalculator: FeedbackAnalyzer;
    private feedbackSorter: FeedbackHandler;

    constructor(feedbackData: FeedbackData[]) {
        this.feedbackData = feedbackData;
        this.feedbackCalculator = new FeedbackAnalyzer(feedbackData);
        this.feedbackSorter = new FeedbackHandler();
    }

     getTop5ByCombinedAvg(): FoodItemStats[] {
        const averages = this.feedbackCalculator.calculateAverages();
        return this.feedbackSorter.getTopOverallAvg(averages);
    }

     getAllCombinedAvg(): FoodItemStats[] {
        const averages = this.feedbackCalculator.calculateAverages();     
        return this.feedbackSorter.getallAvgItem(averages);
    }
}