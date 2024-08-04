import readline from 'readline';
import UserPromptUtils from '../utils/userPrompt';
import SocketHandler from '../Handler/socketHandler';
import AuthService from './loginUI';

class EmployeeUI {
    private promptUtils: UserPromptUtils;
    public userId: number | undefined;

    constructor(
        private rl: readline.Interface,
        private socketHandler: SocketHandler,
        private authService: AuthService
    ) {
        this.promptUtils = new UserPromptUtils(this.rl);
    }

    public viewMenu(userId: number) {
        this.userId = userId;
        console.log('User ID:', userId);
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
                this.giveFeedback();
                break;
            case '3':
                this.viewNotifications();
                break;
            case '4':
                this.giveResponseToRolloutMenu();
                break;
            case '5':
                this.updateProfile();
                break;
            case '6':
                console.log('Exiting...');
                this.rl.close();
                this.socketHandler.emitEvent('disconnect');
                break;
            default:
                console.log('Invalid option, please try again.');
                this.viewMenu(this.userId!);
                break;
        }
    }

    private viewAllMenuItems() {
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

            this.viewMenu(this.userId!);
        });
    }

    private async giveFeedback() {
        console.log('Giving feedback...');
        const item_Id = await this.promptUtils.askQuestion('Enter the item ID:');
        const Comment = await this.promptUtils.askQuestion('Enter your feedback comment:');
        const Rating = await this.promptUtils.askQuestion('Enter your rating (1-5):');
        const date = new Date();
        const feedbackDate = date.toISOString().slice(0, 19).replace('T', ' ');

        const feedbackData = {
            item_Id,
            user_Id: this.userId,
            Comment,
            Rating,
            feedbackDate
        };

        this.socketHandler.emitEvent('giveFeedback', feedbackData);
        console.log('Feedback submitted successfully.');
        this.viewMenu(this.userId!);
    }

    private viewNotifications() {
        this.socketHandler.emitEvent('showEmployeeNotifications');
        this.socketHandler.onEvent('getEmployeeNotification', (data: any) => {
            if (data.showNotificationsEmployee) {
                console.table(data.showNotificationsEmployee.map((item: any) => ({
                    Message: item.message,
                    Date: item.notification_date
                })));
            } else if (data.message) {
                console.log(data.message);
            } else {
                console.log('No Notifications found.');
            }

            console.log('---------------------------------------');
            this.viewMenu(this.userId!);
        });
    }

    private async giveResponseToRolloutMenu() {
        const mealType = await this.promptUtils.askQuestion('Enter the meal type: (1 for Breakfast, 2 for Lunch, 3 for Dinner)');
        const mealTypeMap = { '1': 'Breakfast', '2': 'Lunch', '3': 'Dinner' };
        const selectedMealType = mealTypeMap[mealType as keyof typeof mealTypeMap] || 'Unknown';

        this.socketHandler.emitEvent('getRolloutitem', { meal_type: selectedMealType });
        this.socketHandler.onEvent('getRolloutData', async (data: any) => {
            if (data && data.length > 0) {
                const uniqueItems = new Map<string, any>();

                for (const item of data) {
                    if (!uniqueItems.has(item.menuName)) {
                        uniqueItems.set(item.menuName, item);
                    }
                }

                const tableData = Array.from(uniqueItems.values()).map((item: any) => ({
                    'Menu Item Id': item.menuItem_id,
                    'Menu Name': item.menuName
                }));
                console.table(tableData);

                const selectItem = await this.promptUtils.askQuestion('Enter one menu item ID which you want to prepare today:');
                console.log('User selected:', selectItem);

                this.socketHandler.emitEvent('insertVotedItem', {
                    selectItem,
                    userId: this.userId,
                    selectedMealType
                });

                console.log('Thank you for your vote.');
                console.log('-----------------------------------------');
                this.viewMenu(this.userId!);
            } else {
                console.log('No rollout items found.');
                console.log('-----------------------------------------');
                this.viewMenu(this.userId!);
            }
        });
    }

    private async updateProfile() {
        console.log('Updating profile...');
        const dietaryPreferenceMap = { '1': 'Vegetarian', '2': 'Non-vegetarian', '3': 'Eggetarian' };
        const spiceLevelMap = { '1': 'High', '2': 'Medium', '3': 'Low' };
        const cuisinePreferenceMap = { '1': 'North-Indian', '2': 'South-Indian', '3': 'Other' };

        const userDietaryPreferenceInput = await this.promptUtils.askQuestion('Enter your preference: (1. Vegetarian, 2. Non-vegetarian, 3. Eggetarian): ');
        const userSpiceLevelInput = await this.promptUtils.askQuestion('Enter your spicy level: (1. High, 2. Medium, 3. Low): ');
        const userCuisinePreferenceInput = await this.promptUtils.askQuestion('What do you prefer most: (1. North-Indian, 2. South-Indian, 3. Other): ');
        const userSweetToothInput = await this.promptUtils.askQuestion('Do you have a sweet tooth? (1 for Yes / 0 for No): ');

        const profileData = {
            user_Id: this.userId,
            user_dietary_preference: dietaryPreferenceMap[userDietaryPreferenceInput as keyof typeof dietaryPreferenceMap] || 'Other',
            user_spice_level: spiceLevelMap[userSpiceLevelInput as keyof typeof spiceLevelMap] || 'Medium',
            user_cuisine_preference: cuisinePreferenceMap[userCuisinePreferenceInput as keyof typeof cuisinePreferenceMap] || 'Other',
            user_sweet_tooth: parseInt(userSweetToothInput, 10) || 0
        };

        this.socketHandler.emitEvent('UpdateProfile', profileData);
        console.log('Profile updated successfully.');
        this.viewMenu(this.userId!);
    }
}

export default EmployeeUI;
