import readline from 'readline';
import { Socket } from 'socket.io-client';
import UserPromptUtils from '../utils/userPrompt';

class AdminService {
    private promptUtils: UserPromptUtils;

    constructor(private rl: readline.Interface, private socket: Socket) {
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


    //view logs
   private viewLogs() {
        this.socket.emit('viewLogs');
        this.socket.on('viewLogs', (Logs: any) => {
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
        this.socket.emit('viewDiscardMenuItem');
        this.socket.on('viewDiscardMenuItem', (Logs: any) => {
            console.table(Logs.showMenuItem.map((item:any) => ({
                'Item Name': item.item_name,
                'Rating': item.Rating,
                'Comment': item.Comment,
            })));
            console.log('---------------------------------------');
            this.viewMenu();
        });
    }


   private async addMenuItem() {
        const item_name = await this.promptUtils.askQuestion('Enter Item Name:');
        const meal_type = await this.promptUtils.askQuestion('Enter Meal Type (1. for Breakfast 2. for lunch 3. for dinner):');
        const price = await this.promptUtils.askQuestion('Enter Price:');
        const availability_status = await this.promptUtils.askQuestion('Enter Availability (1 for Yes/0 for No):');
        this.socket.emit('addNewMenuItem', { item_name, meal_type, price, availability_status });
        this.viewMenu();
    }

   private async updateMenuItem() {
            const item_Id = await this.promptUtils.askQuestion('Enter Item ID:');
            const item_name = await this.promptUtils.askQuestion('Enter Item Name:');
            const meal_type = await this.promptUtils.askQuestion('Enter Meal Type (1. for Breakfast/ 2. for lunch/ 3. for dinner):');
            const price = await this.promptUtils.askQuestion('Enter Price:');
            const availability_status = await this.promptUtils.askQuestion('Enter Availability (1 for Yes/0 for No):');
            const rating = await this.promptUtils.askQuestion('Enter rating:');
                 
        this.socket.emit('updateExisitingMenuItem', { item_Id, item_name, meal_type, rating, price, availability_status });
        this.viewMenu();
    }

   private async deleteMenuItem() {
    const item_Id = await this.promptUtils.askQuestion('Enter Item ID:');
            this.socket.emit('deleteExisitingMenuItem', { item_Id });
            this.viewMenu();
    }

    private async updateItemAvailability() {
            const item_Id = await this.promptUtils.askQuestion('Enter menu item ID to update availability:');
            const availability_status = await this.promptUtils.askQuestion('Is the item available? (1 for Yes/0 for No):');    
            this.socket.emit('updateItemAvailability', { item_Id,availability_status });
            this.viewMenu();
    }
}

export default AdminService;
