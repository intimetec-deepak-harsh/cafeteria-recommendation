import { io } from 'socket.io-client';
import readline from 'readline';
import AdminService from './src/service/adminService';
import ChefService from './src/service/chefService';
import EmployeeService from './src/service/employeeService';


class App {
    private  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

private  username: string | undefined;
private  userId: number| undefined;
private  socket = io('http://localhost:8080');
private userRole: string | undefined;

constructor() {
    this.setupSocketListeners();
    this.authenticateUser();
}

//function to authenticate user email and password
public authenticateUser = () => {
    this.rl.question('Enter email: ', (email) => {
        this.rl.question('Enter password: ', (password) => {
            this.socket.emit('authenticate', { email, password },(error: any) => {

            if (error) {
                    console.error('Authentication failed:', error);
                    this.rl.close();
                }
            });
        });
    });
};

// Function to handle role-based navigation after authentication
private handleRoleBasedNavigation = (role: string) => {
    switch (role) {
        case 'Admin':
            new AdminService(this.rl, this.socket).viewMenu();
            break;
        case 'Chef':
            new ChefService(this.rl, this.socket).viewMenu();
            break;
        case 'Employee':
           new EmployeeService(this.rl, this.socket).viewMenu(this.userId!);
            break;
        default:
            this.rl.close();
            break;
    }
};


public setupSocketListeners = () => {

    var userRole = 'Employee';


// Event listener when socket connects to server
this.socket.on('connect', () => {
    console.log('Connected to server with ID:', this.socket.id);
    console.log('successfully connected with server');
    this.authenticateUser();
});

// Event listener when user is authenticated
this.socket.on('user',(message)=> {
    console.log('see user',message)
    this.username = message;
});


// Event listener when user is authenticated
this.socket.on('userID',(message)=> {
    console.log('see userID',message)
    this.userId = message;
});

this.socket.on('authenticated', (message) => {
    console.log(message);
});

// Event listener when user's role is received
this.socket.on('role', (message) => {
    console.log(`Welcome, ${this.username} to Cafeteria Recommendation. Your Role is: ${message}`);
    console.log('--------------------------------------------');
    const role = message;
    this.handleRoleBasedNavigation(role);
});


this.socket.on('authentication_failed', (message) => {
    console.error('Authentication failed:', message);
    this.authenticateUser(); // Prompt the user to try again
});



this.socket.on('recommendedItemsByChef', (recommendedItems: any[]) => {
    console.log('_____________________________________________________________________');
    console.log('Recommended Food:');
    console.table(recommendedItems.map(item => ({
        ItemId : item.item_Id,
        ItemName: item.item_name,
        // Category: item.category,
        Rating: item.rating,
        // Vote: item.vote
    })));
    console.log('_____________________________________________________________________');
    if(userRole === 'Admin'){
       new AdminService(this.rl, this.socket).viewMenu();
    }else if (userRole === 'Chef'){
        new ChefService(this.rl, this.socket).viewMenu();
    }
});

// Event listener for general errors
this.socket.on('error', (message) => {
    console.error('Error:', message);
    this.rl.close();
});

this.socket.on('menuItemAdded', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    new AdminService(this.rl,this.socket).viewMenu();
});

this.socket.on('menuItemUpdated', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    new AdminService(this.rl,this.socket).viewMenu();
});

this.socket.on('menuItemDeleted', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    new AdminService(this.rl,this.socket).viewMenu();
});

this.socket.on('feedbackAdded', (message) => {
    console.log(message);
    console.log('---------------------------------------');
   new EmployeeService(this.rl,this.socket).viewMenu(this.userId!);
});

this.socket.on('ProfileUpdated', (message) => {
    console.log(message);
    console.log('---------------------------------------');
   new EmployeeService(this.rl,this.socket).viewMenu(this.userId!);
});

this.socket.on('disconnect', () => {
    console.log('Disconnected from server');
    this.rl.close();
});
 

};
}
export default  App ;
new App();