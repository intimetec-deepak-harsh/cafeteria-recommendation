import readline from 'readline';


class ChefService {

  public static viewMenu(rl: readline.Interface, socket: any) {
        console.log('1. View Feedback');
        console.log('2. Show Recommendation Menu item');
        console.log('3. Exit');

        rl.question('Select Option: ', (option) => {
            if (option === '1') {
                this.viewFeedbacks(rl, socket);
            } else if (option === '2') {
                this.showRecommendationMenuItem(rl, socket);
            } else if (option === '3') {
                console.log('Exiting...');
                rl.close();
                socket.disconnect();
            } else {
                console.log('Invalid option, please try again.');
                this.viewMenu(rl, socket);
            }
        });
    }

    public  static viewFeedbacks(rl: readline.Interface, socket: any) {
        socket.emit('viewFeedback');
        socket.on('viewFeedback', (feedbackData: any) => {
            feedbackData.showFeedback.forEach((item: any) => {
                console.log(`User Id: ${item.userId}, Rating: ${item.Rating}, Comments: ${item.Comment}`);
            });
            console.log('---------------------------------------');
            this.viewMenu(rl, socket);
        });
    }

    public  static showRecommendationMenuItem(rl: readline.Interface, socket: any) {
        console.log('Showing recommendation menu items...');
        this.viewMenu(rl, socket);
    }
}


export default ChefService;