// import SentimentAnalysisService from '../services/sentimentService';
// import { Recommendation } from '../interface/recommendation';
// import { connectDB, getDbConnection } from '../database/connection';

// class RecommendationService {
//     async generateRecommendation(menuItemId: number): Promise<Recommendation> {
//         try {
//             const db = await connectDB(); // Establish connection
//             const { averageRating, averageSentimentScore } = await SentimentAnalysisService.calculateAverageSentiment(menuItemId);
//             console.log(averageRating, averageSentimentScore);

//             const [rows] = await db.query<Recommendation[]>(
//                 'INSERT INTO recommendations (menuItem_id, averageRating, averageSentimentScore, recommendation_date) VALUES (?, ?, ?, NOW())',
//                 [menuItemId, averageRating, averageSentimentScore]
//             );
//             console.log(rows);
//             db.end(); // Close the connection

//             return rows[0];
//         } catch (error) {
//             console.error('Error generating recommendation:', error);
//             throw error;
//         }
//     }

//     async getRecommendations(): Promise<Recommendation[]> {
//         try {
//             const db = await connectDB(); // Establish connection
//             const [rows] = await db.query<Recommendation[]>(
//                 'SELECT * FROM recommendations'
//             );

//             db.end(); // Close the connection

//             return rows;
//         } catch (error) {
//             console.error('Error fetching recommendations:', error);
//             throw error;
//         }
//     }
// }

// export default new RecommendationService();




import Sentiment from "sentiment";
import FeedbackData  from "../interface/feedback";

class EngineSentimentAnalysisService {
  private sentiment: Sentiment;

  constructor() {
    this.sentiment = new Sentiment();
  }

  async analyzeFeedbackSentiments(
    feedbacks: FeedbackData[]
  ): Promise<{ feedback_id: number; sentiment: number }[]> {
    const sentimentResults = feedbacks.map((feedback) => {
      const result = this.sentiment.analyze(feedback.comment);
      return {
        feedback_id: feedback.feedback_id,
        sentiment: result.score,
        rating: feedback.rating,
      };
    });

    return sentimentResults;
  }

  async calculateAverageSentiment(feedbacks: FeedbackData[]): Promise<number> {
    const sentimentResults =
      await engineSentimentAnalysisService.analyzeFeedbackSentiments(feedbacks);

    let totalSentiment = 0;
    for (const feedback of feedbacks) {
      const sentiment =
        sentimentResults.find(
          (result) => result.feedback_id === feedback.feedback_id
        )?.sentiment || 0;
      totalSentiment += sentiment;
    }

    const averageSentiment = totalSentiment / feedbacks.length;
    return averageSentiment;
  }
}

export const engineSentimentAnalysisService =   new EngineSentimentAnalysisService();