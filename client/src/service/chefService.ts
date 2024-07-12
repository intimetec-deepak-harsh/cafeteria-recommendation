import readline from 'readline';
import { Socket } from 'socket.io-client';
import { MealType, Recommendation } from "../interface/recommendation";
import UserPromptUtils from '../utils/userPrompt';

class ChefService {
    private promptUtils: UserPromptUtils;

    constructor(private rl: readline.Interface, private socket: Socket) {
        this.promptUtils = new UserPromptUtils(this.rl);
    }

    public viewMenu() {
        console.log('1. View All Menu Items');
        console.log('2. View Meal Types');
        console.log('3. View Notifications');
        console.log('4. Rollout Menu item');
        console.log('5. View Recommended Food');
        console.log('6. View All Available Food Items');
        console.log('7. View Voted Items');
        console.log('8. View Discard Menu List');
        console.log('9. View All the Feedbacks.');
        console.log('10. Exit');

        this.rl.question('Select Option: ', (option) => {
            this.handleMenuOption(option);
        });
    }

    private  handleMenuOption(option: string): void {
        switch (option) {
            case '1':
                this.viewAllMenuItems();
                break;
            case '2':
                this.viewMealTypes();
                break;
            case '3':
                this.viewNotifications();
                break;
            case '4':
                 this.rolloutRecommendedMenu();
                break;
            case '5':
                this.viewFoodRecommendationForMeal();
                break;
            case '6':
                this.viewAvailableFoodItems();
                break;
            case '7':
                this.viewVotedItems();
                break;
            case '8':
                this.viewDiscardMenuList();
                break;
            case '9':
                this.viewFeedbacks();
                break;
            case '10':
                console.log('Exiting...');
                this.rl.close();
                this.socket.disconnect();
                break;
            default:
                console.log('Invalid option, please try again.');
                this.viewMenu();
                break;
        }
    }

    private viewAllMenuItems() {
        this.socket.emit('viewMenu');
        this.socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Id: item.item_Id,
                Name: item.item_name,
                'Meal Type': item.meal_type === 1 ? 'Breakfast' : item.meal_type === 2 ? 'Lunch' : item.meal_type === 3 ? 'Dinner' : 'Unknown',
                Rating: item.rating,
                Price: item.price,
                Availability: item.availability_status === 1 ? 'Yes' : 'No'
            }));
            console.table(tableData);
            this.viewMenu();
        });
    }

    private viewFeedbacks() {
        this.socket.emit('viewFeedback');
        this.socket.on('viewFeedback', (feedbackData: any) => {
            console.table(feedbackData.showFeedback.map((item: any) => ({
                'User': item.user_name,
                'Item': item.item_name,
                'Rating': item.Rating,
                'Comments': item.Comment
            })));
            console.log('---------------------------------------');
            this.viewMenu();
        });
    }

    private viewNotifications() {
        this.socket.emit('seeNotifications'); 
        this.socket.on('showNotification', (Notification: any) => {
            console.table(Notification.showNotifications.map((item: any) => ({

                'Message':item.message,
                'Date':item.notification_date
            })));
          console.log('---------------------------------------');
          this.viewMenu(); 
        });   
    }

    private async viewDiscardMenuList() {
        // Implementation for viewing discard menu list
    }

    private async viewFoodRecommendationForMeal() {
        console.log('Type 1 for Breakfast');
        console.log('Type 2 for Lunch');
        console.log('Type 3 for Dinner');

        const categoryChoice = await this.promptUtils.askQuestion('Enter choice: ');
       
        let category: string;
        switch (categoryChoice) {
            case '1':
                category = 'Breakfast';
                break;
            case '2':
                category = 'Lunch';
                break;
            case '3':
                category = 'Dinner';
                break;
            default:
                console.log('Invalid choice, defaulting to Breakfast.');
                category = 'Breakfast';
                break;
        }
        
        this.socket.emit('getRecommendedFood', category );

        this.socket.on('getRecommendedFood', (Recommendation: any) => {
            
            console.table(Recommendation.showRecommendation.map((item: any) => ({
                'Item Id': item.itemId,
                'Item': item.foodItem,
                'Rating': item.avgRating,
                'Sentiment score': item.avgSentimentRating,
                'Average': item.combinedAvg
            })));
            console.log('---------------------------------------');
            this.viewMenu();
        });
    }

    public async rolloutRecommendedMenu(){
        const selectedItemId = await this.promptUtils.askQuestion('Enter all the itemId you want to roll out: ');
        this.socket.emit('rolloutRecommendedFood', { selectedItemId });
    }

    private async viewVotedItems(){
        console.log('Type 1 for Breakfast');
        console.log('Type 2 for Lunch');
        console.log('Type 3 for Dinner');
        
        const categoryChoice = await this.promptUtils.askQuestion('Enter choice: ');

        let category: string;
        switch (categoryChoice) {
            case '1':
                category = 'Breakfast';
                break;
            case '2':
                category = 'Lunch';
                break;
            case '3':
                category = 'Dinner';
                break;
            default:
                console.log('Invalid choice, defaulting to Breakfast.');
                category = 'Breakfast';
                break;
        }

        await this.socket.emit('viewVotes', { category });
    }

    private async userInput(){
        console.log('Type 1 for Breakfast');
        console.log('Type 2 for Lunch');
        console.log('Type 3 for Dinner');
        
        const categoryChoice = await this.promptUtils.askQuestion('Enter choice: ');

        let category: string;
        switch (categoryChoice) {
            case '1':
                category = 'Breakfast';
                break;
            case '2':
                category = 'Lunch';
                break;
            case '3':
                category = 'Dinner';
                break;
            default:
                console.log('Invalid choice, defaulting to Breakfast.');
                category = 'Breakfast';
                break;
        }
        return category;
    }


    private viewAvailableFoodItems() {
        this.socket.emit('viewAvailableMenuItem');
        this.socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Name: item.item_name,
                'Meal Type': item.meal_type,
                Rating: item.rating,
                Price: item.price,
            }));
            console.table(tableData);
            this.viewMenu();
        });
    }

    private viewMealTypes() {
        this.socket.emit('viewMealType');
        this.socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                'Meal Type': item.meal_type_name,
            }));
            console.table(tableData);
            this.viewMenu();
        });
    }
}

export default ChefService;
