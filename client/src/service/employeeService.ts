import readline from 'readline';

class EmployeeService {

  public static viewMenu(rl: readline.Interface, socket: any) {
        console.log('1. View All Menu Items');
        console.log('2. Give Feedback');
        console.log('3. View Notification');
        console.log('5. Exit');

        rl.question('Select Option: ', (option) => {
            if (option === '1') {
                EmployeeService.viewAllMenuItem(rl,socket);
            } else if (option === '2') {
                this.giveFeedback(rl,socket);
            } else if (option === '3') {
                this.seeNotifications(rl,socket);
            } 
             else if (option === '5') {
                console.log('Exiting...');
                rl.close();
                    socket.disconnect();
            } else {
                console.log('Invalid option, please try again.');
                 this.viewMenu(rl,socket);
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
            this.viewMenu(rl,socket);
        });
    }

    public static  giveFeedback(rl: readline.Interface, socket: any) {
        console.log('Giving feedback...');
        rl.question('Enter Item ID: ', (item_Id) => { 
        rl.question('Enter User ID: ', (userId) => { 
        rl.question('Enter your Feedback: ', (Comment) => { 
        rl.question('Enter Rating: ', (Rating) => {
        const date = new Date();
        const feedbackDate = date.toISOString().slice(0, 19).replace('T', ' ');

        socket.emit('giveFeedback', {item_Id, userId, Comment, Rating,feedbackDate });
       });    
         });
          });    
            });

    }


    
    public static async seeNotifications(rl: readline.Interface, socket: any) {
            socket.emit('seeNotifications'); 
            socket.on('showNotification', (Notification: any) => {
                console.table(Notification.showNotifications.map((item: any) => ({
                    'Id': item.notification_id,
                    'Type':item.notification_type,
                    'Message':item.message,
                    'Date':item.notification_date
                })));
              console.log('---------------------------------------');
              this.viewMenu(rl, socket); 
            });   
        }
}


export default EmployeeService;