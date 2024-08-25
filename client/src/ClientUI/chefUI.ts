import readline from 'readline';
import UserPromptUtils from '../utils/userPrompt';
import SocketHandler from '../Handler/socketHandler';

class ChefUI {
    private promptUtils: UserPromptUtils;

    constructor(private rl: readline.Interface, private socketHandler: SocketHandler) {
        this.promptUtils = new UserPromptUtils(this.rl);
    }

    public displayMainMenu() {
        console.log('1. View Menu Items');
        console.log('2. Generate Monthly Report');
        console.log('3. View Recommended Food');
        console.log('4. Rollout Menu Item');
        console.log('5. View All Available Food Items');
        console.log('6. View Voted Items');
        console.log('7. View All the Feedbacks.');
        console.log('8. View Discard Menu');
        console.log('9. Exit');

        this.rl.question('Select Option: ', (option) => {
            this.processMenuSelection(option);
        });
    }

    private processMenuSelection(option: string): void {
        try {    
            switch (option) {
                case '1':
                    this.displayAllMenuItems();
                    break;
                case '2':
                    this.generateMonthlyReport();
                    break;
                case '3':
                    this.displayMealRecommendations();
                    break;
                case '4':
                    this.rolloutRecommendedMenu();         
                    break;
                case '5':
                    this.viewAvailableFoodItems();
                    break;
                case '6':
                    this.displayVotedItems();
                    break;
                case '7':
                    this.displayFeedbacks();
                    break;
                case '8':
                    this.viewDiscardMenuList();
                    break;
                case '9':
                    this.exitApplication();
                    break;
                default:
                    console.log('Invalid option, please try again.');
                    this.displayMainMenu();
                    break;
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('An error occurred:', error.message);
            } else {
                console.error('An unexpected error occurred');
            }
            this.displayMainMenu();
        }    
    }

    private exitApplication(): void {
        console.log('Exiting...');
        this.rl.close();
        this.socketHandler.emitEvent('disconnect');
    }

    private displayAllMenuItems() {
        this.socketHandler.emitEvent('viewMenu');
        this.socketHandler.onEvent('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Id: item.item_Id,
                Name: item.item_name,
                'Meal Type': item.meal_type === 1 ? 'Breakfast' : item.meal_type === 2 ? 'Lunch' : item.meal_type === 3 ? 'Dinner' : 'Unknown',
                Price: item.price,
                Availability: item.availability_status === 1 ? 'Yes' : 'No'
            }));
            console.table(tableData);
            this.displayMainMenu();
        });
    }

    private async generateMonthlyReport() {
        try {
            const startDate = await this.promptUtils.askQuestion('Enter Start Date in (YYYY-MM-DD) Format: ');
            const endDate = await this.promptUtils.askQuestion('Enter End Date in (YYYY-MM-DD) Format: ');
            
            this.socketHandler.emitEvent('generateMonthlyReport', { startDate, endDate });
            this.socketHandler.onEvent('generateFeedbackReport', (data: any) => {
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
                this.displayMainMenu();
            });
        } catch (error) {
            console.error('Error generating report:', error);
            this.displayMainMenu();
        }    
    }

    private async displayMealRecommendations() {
        console.log('Type 1 for Breakfast');
        console.log('Type 2 for Lunch');
        console.log('Type 3 for Dinner');
        try {    
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

        this.socketHandler.emitEvent('getRecommendedFood', category);
        this.socketHandler.emitEvent('getAllItemRecommended');

        this.socketHandler.onEvent('getRecommendedFood', (Recommendation: any) => {
            console.table(Recommendation.showRecommendation.map((item: any) => ({
                'Item Id': item.itemId,
                'Item': item.foodItem,
                'Rating': item.combinedAvg,
                'Sentiment Score': item.avgSentimentRating,
            })));
            console.log('---------------------------------------');
            this.displayMainMenu();
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        this.displayMainMenu();
    }
    }

    public async rolloutRecommendedMenu() {
        try {
            const selectedItemId = await this.promptUtils.askQuestion('Enter all the itemId you want to roll out: ');
            this.socketHandler.emitEvent('rolloutRecommendedFood', { selectedItemId });
            this.displayMainMenu();
        } catch (error) {
            console.error('Error during rollout:', error);
            this.displayMainMenu();
        }    
    }

    private viewAvailableFoodItems() {
        this.socketHandler.emitEvent('viewAvailableMenuItem');
        this.socketHandler.onEvent('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Name: item.item_name,
                'Meal Type': item.meal_type === 1 ? 'Breakfast' : item.meal_type === 2 ? 'Lunch' : item.meal_type === 3 ? 'Dinner' : 'Unknown',
                Price: item.price,
            }));
            console.table(tableData);
            this.displayMainMenu();
        });
    }

    private async displayVotedItems() {
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

        this.socketHandler.emitEvent('viewVotes', { category });
        this.socketHandler.onEvent('userVotedMenu', (voteItems: any) => {
            if (voteItems.message) {
                console.log(voteItems.message);
            } else if (voteItems && Array.isArray(voteItems)) {
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
            this.displayMainMenu();
        });
    }

    private displayFeedbacks() {
        this.socketHandler.emitEvent('viewFeedback');
        this.socketHandler.onEvent('viewFeedback', (feedbackData: any) => {
            console.table(feedbackData.showFeedback.map((item: any) => ({
                'User': item.user_name,
                'Item': item.item_name,
                'Rating': item.Rating,
                'Comments': item.Comment
            })));
            console.log('---------------------------------------');
            this.displayMainMenu();
        });
    }

    private async viewDiscardMenuList() {
        this.socketHandler.emitEvent('viewDiscardMenuItem');

        this.socketHandler.onEvent('viewDiscardMenuItem', async (Logs: any) => {
            console.table(Logs.showMenuItem.map((item: any) => ({
                'Item Id': item.itemId,
                'Item Name': item.foodItem,
                'Rating': item.avgRating,
                'Sentiment Score': item.avgSentimentRating,
            })));
            console.log('---------------------------------------');

            console.log('Do you want to remove the item from Menu?');
            const removeItem = await this.promptUtils.askQuestion('1 for YES | 2 for NO: ');

            if (removeItem === '1') {
                const item_Id = await this.promptUtils.askQuestion('Enter Item ID you want to remove: ');
                this.socketHandler.emitEvent('DiscardMenuItem', { item_Id });
                this.displayMainMenu();
            } else {
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

                    this.socketHandler.emitEvent('addDetailedFeedbackQuestions', { itemId, itemName, questions });
                    console.log('Thank you for your feedback!');
                } else {
                    console.log('Invalid Item ID entered.');
                }
                this.displayMainMenu();
            }
        });

        this.socketHandler.onEvent('noData', (message: string) => {
            console.log('Output:', message);
            console.log('---------------------------------------');
            this.displayMainMenu();
        });
    }
}

export default ChefUI;

