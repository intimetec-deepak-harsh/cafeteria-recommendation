import readline from 'readline';
import SocketHandler from '../Handler/socketHandler';
import UserPromptUtils from '../utils/userPrompt';

class AdminUI {
    private promptUtils: UserPromptUtils;

    constructor(private rl: readline.Interface, private socketHandler: SocketHandler) {
        this.promptUtils = new UserPromptUtils(this.rl);
    }

    public viewMenu() {
        console.log('1. View All Menu Items');
        console.log('2. Add New Menu Items');
        console.log('3. Update Menu Items');
        console.log('4. Delete Menu Items');
        console.log('5. Update Menu Availability');
        console.log('6. View Logs');
        console.log('7. View Discard Menu');
        console.log('8. Exit');

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
                this.addMenuItem();
                break;
            case '3':
                this.updateMenuItem();
                break;
            case '4':
                this.deleteMenuItem();
                break;
            case '5':
                this.updateItemAvailability();
                break;
            case '6':
                this.viewLogs();
                break;  
            case '7':
                this.viewDiscardMenuList();
                break;  
            case '8':
                console.log('Exiting...');
                this.rl.close();
                this.socketHandler.disconnect();
                break;
            default:
                console.log('Invalid option, please try again.');
                this.viewMenu();
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
            this.viewMenu();
        });
    }

    private viewLogs() {
        this.socketHandler.emitEvent('viewLogs');
        this.socketHandler.onEvent('viewLogs', (Logs: any) => {
            console.table(Logs.showLogs.map((item: any) => ({
                'User': item.user_id,
                'Action': item.action,
                'Time': item.timestamp,
            })));
            console.log('---------------------------------------');
            this.viewMenu();
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
            this.viewMenu();
        });

        this.socketHandler.onEvent('noData', (message: string) => {
            console.log('Output:', message);
            console.log('---------------------------------------');
            this.viewMenu();
        });
    }

    private async addMenuItem() {
        const item_name = await this.promptUtils.askQuestion('Enter Item Name:');
        const meal_type = await this.promptUtils.askQuestion('Enter Meal Type (1. for Breakfast 2. for lunch 3. for dinner):');
        const price = await this.promptUtils.askQuestion('Enter Price:');
        const availability_status = await this.promptUtils.askQuestion('Enter Availability (1 for Yes/0 for No):');
        const dietary_type = await this.promptUtils.askQuestion('Enter Dietary Type (1. for vegetarian 2. for non-vegetarian 3. for eggetarian):');
        const spice_type = await this.promptUtils.askQuestion('Enter Spicy Type (1. for high 2. for medium 3. for low):');
        const cuisine_type = await this.promptUtils.askQuestion('Enter Cuisine Type (1. for north-indian 2. for south-indian  3.for other):');
        const sweet_tooth_type = await this.promptUtils.askQuestion('Do you have Sweeth Tooth (1. for Yes 0. for NO):');

        this.socketHandler.emitEvent('addNewMenuItem', { item_name, meal_type, price, availability_status, dietary_type, spice_type, cuisine_type, sweet_tooth_type });
        this.viewMenu();
    }

    private async updateMenuItem() {
        const item_Id = await this.promptUtils.askQuestion('Enter Item ID:');
        const item_name = await this.promptUtils.askQuestion('Enter Item Name:');
        const meal_type = await this.promptUtils.askQuestion('Enter Meal Type (1. for Breakfast/ 2. for lunch/ 3. for dinner):');
        const price = await this.promptUtils.askQuestion('Enter Price:');
        const availability_status = await this.promptUtils.askQuestion('Enter Availability (1 for Yes/0 for No):');

        this.socketHandler.emitEvent('updateExisitingMenuItem', { item_Id, item_name, meal_type, price, availability_status });
        this.viewMenu();
    }

    private async deleteMenuItem() {
        const item_Id = await this.promptUtils.askQuestion('Enter Item ID:');
        console.log('Are you sure! you want to Delete item ?');
        const response = await this.promptUtils.askQuestion('1 for Yes | 2 for No :');

        if (response == '1') {
            this.socketHandler.emitEvent('deleteExisitingMenuItem', { item_Id });
            this.viewMenu();
        } else {
            this.viewMenu();
        }
    }

    private async updateItemAvailability() {
        const item_Id = await this.promptUtils.askQuestion('Enter menu item ID to update availability:');
        const availability_status = await this.promptUtils.askQuestion('Is the item available? (1 for Yes/0 for No):');
        this.socketHandler.emitEvent('updateItemAvailability', { item_Id, availability_status });
        this.viewMenu();
    }
}

export default AdminUI;
