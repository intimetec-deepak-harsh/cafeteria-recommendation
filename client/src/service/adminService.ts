import readline from 'readline';

class AdminService {
    public static viewMenu(rl: readline.Interface, socket: any) {
        console.log('1. View All Menu Items');
        console.log('2. Add New Menu Items');
        console.log('3. Update Menu Items');
        console.log('4. Delete Menu Items');
        console.log('5. Update Menu Availability');
        console.log('6. View Logs');
        console.log('8. Exit');

        rl.question('Select Option: ', (option) => {
            this.handleMenuOption(option, rl, socket);
        });
    }

    public static handleMenuOption(option: string, rl: readline.Interface,socket: any): void {
        switch (option) {
            case '1':
                this.viewAllMenuItems(rl,socket);
                break;
            case '2':
                this.addMenuItem(rl,socket);
                break;
            case '3':
                this.updateMenuItem(rl,socket);
                break;
            case '4':
                this.deleteMenuItem(rl,socket);
                break;
            case '5':
                this.updateItemAvailability(rl,socket);
                break;
            case '6':
                this.viewLogs(rl,socket);
                break;    
            case '8':
                console.log('Exiting...');
                rl.close();
                socket.disconnect();
                break;
            default:
                console.log('Invalid option, please try again.');
                this.viewAllMenuItems(rl,socket);
                break;
        }
    }

    public static viewAllMenuItems(rl: readline.Interface, socket: any) {
        socket.emit('viewMenu');

        socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Id: item.item_Id,
                Name: item.item_name,
                'Meal Type': item.meal_type,
                Rating: item.rating,
                Price: item.price,
                Availability: item.availability_status === 1 ? 'Yes' : 'No'
            }));
            console.table(tableData);
            this.viewMenu(rl, socket);
        });
    }


    //view logs
    public static viewLogs(rl: readline.Interface, socket: any) {
        socket.emit('viewLogs');
        socket.on('viewLogs', (Logs: any) => {
            console.table(Logs.showLogs.map((item: any) => ({
                'User': item.user_id,
                'Action': item.action,
                'Time': item.timestamp,
            })));
            console.log('---------------------------------------');
            this.viewMenu(rl, socket);
        });
    }
    

    public static addMenuItem(rl: readline.Interface, socket: any) {
        rl.question('Enter Item Name: ', (item_name) => {
            rl.question('Enter Meal Type(1. for Breakfast/ 2. for lunch/ 3. for dinner): ', (meal_type) => {
                rl.question('Enter Price: ', (price) => {
                    rl.question('Enter Availability (1 for Yes/0 for No): ', (availability_status) => {
                        rl.question('Enter rating: ', (rating) => {
                            socket.emit('addNewMenuItem', { item_name, meal_type, rating, price, availability_status });
                            this.viewMenu(rl, socket);
                        });
                    });
                });
            });
        });
    }

    public static updateMenuItem(rl: readline.Interface, socket: any) {
        rl.question('Enter Item ID: ', (item_Id) => {
            rl.question('Enter Item Name: ', (item_name) => {
                rl.question('Enter Meal Type(breakfast/lunch/dinner): ', (meal_type) => {
                    rl.question('Enter Price: ', (price) => {
                        rl.question('Enter Availability (1 for Yes/0 for No): ', (availability_status) => {
                            rl.question('Enter rating: ', (rating) => {
                                socket.emit('updateExisitingMenuItem', { item_Id, item_name, meal_type, rating, price, availability_status });
                                this.viewMenu(rl, socket);
                            });
                        });
                    });
                });
            });
        });
    }

    public static deleteMenuItem(rl: readline.Interface, socket: any) {
        rl.question('Enter Item ID: ', (item_Id) => {
            socket.emit('deleteExisitingMenuItem', { item_Id });
            this.viewMenu(rl, socket);
        });
    }

    public  static updateItemAvailability(rl: readline.Interface,socket:any) {
        rl.question('Enter menu item ID to update availability:', (item_Id) => {
            rl.question('Is the item available? (1 for Yes/0 for No):', (availability_status) => {
            socket.emit('updateItemAvailability', { item_Id,availability_status });
            this.viewMenu(rl, socket);

            });
        });
    }
}

export default AdminService;
