// Import necessary libraries
import Sentiment from 'sentiment';

// Define the structure for comments and ratings
interface Feedback {
  comment: string;
  rating: number;
}

// Sample static comments and ratings
const feedbacks: Feedback[] = [
  { comment: "The food was excellent and very tasty!", rating: 5 },
  { comment: "It was okay, not the best I've had.", rating: 3 },
  { comment: "I didn't like the food at all, it was terrible.", rating: 1 },
  { comment: "Great service and delicious meals!", rating: 4 },
  { comment: "The food was cold and not fresh.", rating: 2 }
];

// Function to analyze sentiment of comments
function analyzeSentiment(comment: string): string {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(comment);
  return result.score >= 0 ? "Positive" : "Negative";
}

// Function to calculate the average rating
function calculateAverageRating(feedbacks: Feedback[]): number {
  const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  return totalRating / feedbacks.length;
}

// Function to display feedback with sentiment analysis
function displayFeedbackAnalysis(feedbacks: Feedback[]): void {
  feedbacks.forEach(feedback => {
    const sentiment = analyzeSentiment(feedback.comment);
    console.log(`Comment: ${feedback.comment}`);
    console.log(`Rating: ${feedback.rating}`);
    console.log(`Sentiment: ${sentiment}`);
    console.log('---');
  });

  const averageRating = calculateAverageRating(feedbacks);
  console.log(`Average Rating: ${averageRating.toFixed(2)}`);
}

// Main function to run the analysis
function main(): void {
  console.log("Feedback Analysis:");
  displayFeedbackAnalysis(feedbacks);
}

// Execute the main function
main();
