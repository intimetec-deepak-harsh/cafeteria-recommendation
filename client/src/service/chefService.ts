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
        console.log('1. View Menu Items');
        console.log('2. Generate Monthly Report');
        // console.log('3. View Notifications');
        console.log('4. View Recommended Food');
        console.log('5. Rollout Menu Item');
        console.log('6. View All Available Food Items');
        console.log('7. View Voted Items');
        console.log('8. View All the Feedbacks.');
        console.log('9. View Discard Menu');

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
                this.generateMonthlyReport();
                break;
            case '3':
            //     this.viewNotifications();
            //     break;
            case '4':
                this.viewFoodRecommendationForMeal();
                break;
            case '5':
                this.rolloutRecommendedMenu();
                break;
            case '6':
                this.viewAvailableFoodItems();
                break;
            case '7':
                this.viewVotedItems();
                break;
            case '8':
                this.viewFeedbacks();
                break;
            case '9':
                this.viewDiscardMenuList();

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
                Price: item.price,
                Availability: item.availability_status === 1 ? 'Yes' : 'No'
            }));
            console.table(tableData);
            this.viewMenu();
        });
    }


//       // generate Report
private async generateMonthlyReport() {
    const startDate = await this.promptUtils.askQuestion('Enter Start Date in (YYYY-MM-DD) Format: ');
    const endDate = await this.promptUtils.askQuestion('Enter End Date in (YYYY-MM-DD) Format: ');
    console.log('startDate', startDate);
    console.log('endDate', endDate);
    
    this.socket.emit('generateMonthlyReport', { startDate, endDate });

    this.socket.on('generateFeedbackReport', (data: any) => {
        if (data === 'Error in Generating feedback Monthly Report.') {
            console.log(data);
        } else {
            const tableData = data.map((item: any) => ({
                'Menu ID': item.menu_id,
                'Recom. ID': item.recommendation_id,
                'Avg Rating': item.average_rating,
                'Total Feedbacks': item.total_feedbacks,
                'Comments': item.comments
            }));
            console.table(tableData);
        }
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
        this.socket.emit('getAllItemRecommended');

        this.socket.on('getRecommendedFood', (Recommendation: any) => {
            
            console.table(Recommendation.showRecommendation.map((item: any) => ({
                'Item Id': item.itemId,
                'Item': item.foodItem,
                'Rating': item.combinedAvg,
                'Sentiment Score': item.avgSentimentRating,
            })));
            console.log('---------------------------------------');
            this.viewMenu();
        });
    }

    
    public async rolloutRecommendedMenu(){
        const selectedItemId = await this.promptUtils.askQuestion('Enter all the itemId you want to roll out: ');
        this.socket.emit('rolloutRecommendedFood', { selectedItemId });
    }

    private viewAvailableFoodItems() {
        this.socket.emit('viewAvailableMenuItem');
        this.socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Name: item.item_name,
                'Meal Type': item.meal_type=== 1 ? 'Breakfast' : item.meal_type === 2 ? 'Lunch' : item.meal_type === 3 ? 'Dinner' : 'Unknown',
                Price: item.price,
            }));
            console.table(tableData);
            this.viewMenu();
        });
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
            
         this.socket.emit('viewVotes', { category });
         this.socket.on('userVotedMenu', (voteItems: any) => {
           
            if (voteItems.message) {
                console.log(voteItems.message);
            }else if(voteItems && Array.isArray(voteItems)) {
                console.table(voteItems.map((item: any) => ({
                    'Menu Item ID': item.item_Id,
                    'Menu Name': item.item_name,
                    'Category': item.category,
                    'Total Vote': item.vote_count
                })));
            } else {
                console.log('No voted items found.');
            }
            console.log('---------------------------------------');
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

    private async viewDiscardMenuList() {
        // Implementation for viewing discard menu list
        this.socket.emit('viewDiscardMenuItem');

        this.socket.on('viewDiscardMenuItem', async (Logs: any) => {
          
           console.table(Logs.showMenuItem.map((item:any) => ({
               'Item Id': item.itemId,
               'Item Name': item.foodItem,
               'Rating': item.avgRating,
               'Sentiment Score': item.avgSentimentRating,
           })));
           console.log('---------------------------------------');
           
           // this.viewMenu();
           console.log('Do you want to remove the item from Menu?')
           const removeItem =  await this.promptUtils.askQuestion('1 for YES | 2 for NO: ');
           if (removeItem === '1') {
               const item_Id = await this.promptUtils.askQuestion('Enter Item ID you want to remove:');
               this.socket.emit('DiscardMenuItem', { item_Id });
               this.viewMenu();
           }else{
               console.log('---------------------------------------');
               console.log('Get Detailed Feedback:');
               const item_Id = await this.promptUtils.askQuestion('Enter Item ID to get more Detailed Feedback:');
               const menuItem = Logs.showMenuItem.find((item: any) => item.itemId === parseInt(item_Id));

            if (menuItem) {
                const itemId = menuItem.item_Id;
                const itemName = menuItem.foodItem;

                const questions = [
                    `Q1. What did you not like about ${itemName}?`,
                    `Q2. How would you like ${itemName} to taste?`,
                    `Q3. Share your mom's recipe for ${itemName}?`,
                  ];
                    console.log(itemName);
                    console.log(itemId);
                    this.socket.emit('addDetailedFeedbackQuestions', { itemId,itemName, questions });    
                console.log('Thank you for your feedback!');
            } else {
                console.log('Invalid Item ID entered.');
            }
               this.viewMenu();
           }
           
       });

       this.socket.on('noData', (message: string) => {
           console.log('Output:',message);
           console.log('---------------------------------------');

           this.viewMenu();
       });
    }
}

export default ChefService;
