import readline from 'readline';
import { Socket } from 'socket.io-client';
import UserPromptUtils from '../utils/userPrompt';
import { log } from 'console';

class EmployeeService {
    // static viewMenu() {
    //     throw new Error('Method not implemented.');
    // }
    private promptUtils: UserPromptUtils;
    public userId: any;

    constructor(private rl: readline.Interface, private socket: Socket) {
        this.promptUtils = new UserPromptUtils(this.rl);
    }


        public viewMenu(userId:number) {
            this.userId = userId; 
            console.log('user Id: ',userId)
            console.log('1. View All Menu Items');
            console.log('2. Give Feedback');
            console.log('3. View Notification');
            console.log('4. Give Vote to Rollout Menu');
            console.log('5. Update your Profile');

            console.log('6. Exit');

            this.rl.question('Select Option: ', (option) => {
                this.handleMenuOption(option);
            });
        }

    private handleMenuOption(option: string): void {
        switch (option) {
            case '1':
                this.viewAllMenuItems();
                break;
            case '2':
                this.giveFeedback(this.userId);
                break;
            case '3':
                this.viewNotifications();
                break;
            case '4':
                this.giveResponseToRolloutMenu();
                break;
            case '5':
                this.UpdateProfile(this.userId);
                break;    
            case '6':
                console.log('Exiting...');
                this.rl.close();
                this.socket.disconnect();
                break;
            default:
                console.log('Invalid option, please try again.');
                this.viewMenu(this.userId!);
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
            this.viewMenu(this.userId);
        });
    }

    private async giveFeedback(userId:any) {
        console.log('Giving feedback...');
        const item_Id = await this.promptUtils.askQuestion('Enter the item ID:');
        const user_Id = userId;
        
        const Comment = await this.promptUtils.askQuestion('Enter your feedback comment:');
        const Rating = await this.promptUtils.askQuestion('Enter your rating (1-5):');     
        const date = new Date();
        const feedbackDate = date.toISOString().slice(0, 19).replace('T', ' ');

        this.socket.emit('giveFeedback', {item_Id, user_Id, Comment, Rating,feedbackDate });

    }
    
    private viewNotifications() {
            this.socket.emit('seeNotifications'); 
            this.socket.on('showNotification', (Notification: any) => {
                console.table(Notification.showNotifications.map((item: any) => ({

                    'Message':item.message,
                    'Date':item.notification_date
                })));
              console.log('---------------------------------------');
              this.viewMenu(this.userId!); 
            });   
        }

    
    private async giveResponseToRolloutMenu() {
        const item_Id = await this.promptUtils.askQuestion('Enter the item ID:');
            this.socket.emit('sendResponseOnRollout',item_Id);

        }



     public async UpdateProfile(userId:any) {
        const user_Id = userId;
        console.log('check id exist',this.userId);
        const dietaryPreferenceMap = { '1': 'Vegetarian', '2': 'Non Vegetarian', '3': 'Eggetarian' };
        const spiceLevelMap = { '1': 'High', '2': 'Medium', '3': 'Low' };
        const cuisinePreferenceMap = { '1': 'North-Indian', '2': 'South-Indian', '3': 'Other' };
    
        const userDietaryPreferenceInput = await this.promptUtils.askQuestion('Enter your Preference: (1. for Vegetarian, 2. for Non Vegetarian, 3. for Eggetarian)');
        const userSpiceLevelInput = await this.promptUtils.askQuestion('Enter your Spicy Level: (1. High, 2. Medium, 3. Low)');
        const userCuisinePreferenceInput = await this.promptUtils.askQuestion('What do you prefer most: (1. North-Indian, 2. South-Indian, 3. Other)');
        const userSweetToothInput = await this.promptUtils.askQuestion('Do you have a sweet tooth?: (1. for Yes /0. for No)');
    
        // Type assertion to ensure keys are valid
        const user_dietary_preference = dietaryPreferenceMap[userDietaryPreferenceInput as keyof typeof dietaryPreferenceMap] || 'Other';
        const user_spice_level = spiceLevelMap[userSpiceLevelInput as keyof typeof spiceLevelMap] || 'Medium';
        const user_cuisine_preference = cuisinePreferenceMap[userCuisinePreferenceInput as keyof typeof cuisinePreferenceMap] || 'Other';
        const user_sweet_tooth = parseInt(userSweetToothInput, 10) || 0;

        console.log('check user id',user_Id);
        this.socket.emit('UpdateProfile', { user_Id, user_dietary_preference, user_spice_level, user_cuisine_preference, user_sweet_tooth });
    
     }
}


export default EmployeeService;