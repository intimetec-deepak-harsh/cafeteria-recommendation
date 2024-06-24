import readline from 'readline';

class AdminService {
    public static viewMenu(rl: readline.Interface, socket: any) {
        console.log('1. View All Menu Items');
        console.log('2. Add New Menu Items');
        console.log('3. Update Menu Items');
        console.log('4. Delete Menu Items');
        console.log('5. Exit');

        rl.question('Select Option: ', (option) => {
            if (option === '1') {
                this.viewAllMenuItem(rl, socket);
            } else if (option === '2') {
                this.addMenuItem(rl, socket);
            } else if (option === '3') {
                this.updateExistingMenuItem(rl, socket);
            } else if (option === '4') {
                this.deleteExistingMenuItem(rl, socket);
            } else if (option === '5') {
                console.log('Exiting...');
                rl.close();
                socket.disconnect();
                
            } else {
                console.log('Invalid option, please try again.');
                this.viewMenu(rl, socket);
            }
        });
    }

    public static viewAllMenuItem(rl: readline.Interface, socket: any) {
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

    public static addMenuItem(rl: readline.Interface, socket: any) {
        rl.question('Enter Item Name: ', (item_name) => {
            rl.question('Enter Meal Type(breakfast/lunch/dinner): ', (meal_type) => {
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

    public static updateExistingMenuItem(rl: readline.Interface, socket: any) {
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

    public static deleteExistingMenuItem(rl: readline.Interface, socket: any) {
        rl.question('Enter Item ID: ', (item_Id) => {
            socket.emit('deleteExisitingMenuItem', { item_Id });
            this.viewMenu(rl, socket);
        });
    }
}

export default AdminService;
