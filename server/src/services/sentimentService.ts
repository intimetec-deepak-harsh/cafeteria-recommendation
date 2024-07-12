// import Sentiment from 'sentiment';
// import {FeedbackData} from '../interface/feedback'; 
// import { getDbConnection } from '../database/connection'; 
// import mysql from 'mysql2/promise';

// class SentimentService {
//     analyze(Comment: any) {
//         throw new Error('Method not implemented.');
//     }
//     private sentiment: Sentiment;
//     private db: mysql.Connection;

//     constructor() {
//         this.sentiment = new Sentiment();
//         this.db = getDbConnection(); // Get the database connection
//     }

//     // analyzeComment(comment: string): number {
//     //     const result = this.sentiment.analyze(comment);
//     //     return result.score;
//     // }

//     // analyzeRating(rating: number): number {
//     //     return (rating - 3) * 2 / 2; // Normalize the rating to a sentiment score
//     // }

//     async calculateAverageSentiment(menuItemId: number) {
//         try {
//             const [feedbacks] = await this.db.query<FeedbackData[]>('SELECT * FROM feedback WHERE item_Id = ?', [menuItemId]);

//             const totalFeedbacks = feedbacks.length;
//             if (totalFeedbacks === 0) return { averageRating: 0, averageSentimentScore: 0 };

//             const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
//             const totalCommentScore = feedbacks.reduce((acc, feedback) => acc + this.analyzeComment(feedback.comment), 0);

//             const averageRating = totalRating / totalFeedbacks;
//             const averageSentimentScore = totalCommentScore / totalFeedbacks;

//             return { averageRating, averageSentimentScore };
//         } catch (error) {
//             console.error('Error fetching feedbacks:', error);
//             throw error;
//         }
//     }
// }

// export default new SentimentService();



