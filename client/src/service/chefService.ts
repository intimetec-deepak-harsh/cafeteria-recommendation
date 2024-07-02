import readline from 'readline';


class ChefService {

  public static viewMenu(rl: readline.Interface, socket: any) {
        console.log('1. View Menu Items');
        console.log('2. View Meal Types');
        console.log('3. View Notifications');
        console.log('4. Send Notification');
        console.log('5. View Recommendations');
        console.log('6. View Available Food Items');
        console.log('7. View Feedbacks.');

        console.log('8. Exit');

        rl.question('Select Option: ', (option) => {
            this.handleMenuOption(option, rl, socket);
        });
    }

    public static handleMenuOption(option: string, rl: readline.Interface,socket: any): void {
        switch (option) {
            case '1':
                this.viewAllMenuItems(rl, socket);
                break;
            case '2':
                 this.viewMealTypes(rl, socket);
                break;
            case '3':
                // this.viewNotifications(rl, socket);
                break;
            case '4':
                // this.sendNotification(rl, socket);
                break;
            case '5':
                this.showRecommendationMenuItem(rl, socket);
                break;
            case '6':
                this.viewAvailableFoodItems(rl, socket);
                break;
            case '7':
                this.viewFeedbacks(rl, socket);
                break;
            case '8':
                console.log('Exiting...');
                rl.close();
                socket.disconnect();
                break;
            default:
                console.log('Invalid option, please try again.');
                this.viewAllMenuItems(rl, socket);
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
            this.viewMenu(rl,socket);
        });
    }

    public static viewFeedbacks(rl: readline.Interface, socket: any) {
        socket.emit('viewFeedback');
        socket.on('viewFeedback', (feedbackData: any) => {
            console.table(feedbackData.showFeedback.map((item: any) => ({
                'User': item.user_name,
                'Item': item.item_name,
                'Rating': item.Rating,
                'Comments': item.Comment
            })));
            console.log('---------------------------------------');
            this.viewMenu(rl, socket);
        });
    }
    

    public  static showRecommendationMenuItem(rl: readline.Interface, socket: any) {
        console.log('Showing recommendation menu items...');
        socket.emit('viewRecommendation');
        // socket.on('MenuDetails', (data: any) => {
        //     const tableData = data.showMenu.map((item: any) => ({
        //         Id: item.item_Id,
        //         Name: item.item_name,
        //         'Meal Type': item.meal_type,
        //         Rating: item.rating,
        //         Price: item.price,
        //         Availability: item.availability_status === 1 ? 'Yes' : 'No'
        //     }));
        //     console.table(tableData);
        //     this.viewMenu(rl,socket);
        // });
        // this.viewMenu(rl,socket);
    }


    public static viewAvailableFoodItems(rl: readline.Interface, socket: any) {
        socket.emit('viewAvailableMenuItem');
        socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
                Name: item.item_name,
                'Meal Type': item.meal_type,
                Rating: item.rating,
                Price: item.price,
            }));
            console.table(tableData);
            this.viewMenu(rl,socket);
        });

    }

    public static viewMealTypes(rl: readline.Interface, socket: any) {
        socket.emit('viewMealType');
        socket.on('MenuDetails', (data: any) => {
            const tableData = data.showMenu.map((item: any) => ({
              'Meal Type': item.meal_type,
           }));
            console.table(tableData);
            this.viewMenu(rl,socket);
        });
    }
}


export default ChefService;