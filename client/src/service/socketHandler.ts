import { Socket } from 'socket.io-client';
import readline from 'readline';
import AdminService from './adminService';
import ChefService from './chefService';
import EmployeeService from './employeeService';
import AuthService from './authService';

class SocketHandler {
    private username: string | undefined;
    private userId: number | undefined;
    private userRole: string | undefined;

    constructor(
        private rl: readline.Interface,
        private socket: Socket,
        private authService: AuthService,
        private handleRoleBasedNavigation: (role: string) => void,
        private setUserId: (userId: number) => void
    ) {}

    public setupSocketListeners = () => {
        // Event listener when socket connects to server
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
            console.log('Successfully connected with server');
            this.authService.authenticateUser();
        });

        this.socket.on('user', (message) => {
            console.log('User:', message);
            this.username = message;
        });

        this.socket.on('userID', (message) => {
            console.log('UserID:', message);
            this.userId = message;
            if (this.userId !== undefined) {
                this.setUserId(this.userId);  // Set the userId in the main app
            } else {
                console.error('Received undefined userId');
            }
        });

        this.socket.on('authenticated', (message) => {
            console.log('Authenticated:', message);
        });

        this.socket.on('role', (message) => {
            console.log(`Welcome, ${this.username} to Cafeteria Recommendation. Your Role is: ${message}`);
            console.log('--------------------------------------------');
            this.userRole = message;  // Ensure userRole is set
            this.handleRoleBasedNavigation(message);
        });

        this.socket.on('authentication_failed', (message) => {
            console.error('Authentication failed:', message);
            this.authService.authenticateUser(); // Prompt the user to try again
        });

        this.socket.on('recommendedItemsByChef', (recommendedItems: any[]) => {
            console.log('_____________________________________________________________________');
            console.log('Recommended Food:');
            if (recommendedItems && Array.isArray(recommendedItems) && recommendedItems.length > 0) {
                console.table(recommendedItems.map(item => ({
                    ItemId: item.itemId,
                    ItemName: item.foodItem,
                })));
            } else {
                console.log('No recommended items to display or invalid data format.');
            }
            console.log('_____________________________________________________________________');
            this.handleRoleBasedNavigation(this.userRole!);
        });
        
        

        this.socket.on('error', (message) => {
            console.error('Error:', message);
            this.rl.close();
        });

        this.socket.on('menuItemAdded', (message) => {
            console.log(message);
            console.log('---------------------------------------');
            new AdminService(this.rl, this.socket).viewMenu();
        });

        this.socket.on('menuItemUpdated', (message) => {
            console.log(message);
            console.log('---------------------------------------');
            new AdminService(this.rl, this.socket).viewMenu();
        });

        this.socket.on('menuItemDeleted', (message) => {
            console.log(message);
            console.log('---------------------------------------');
            new AdminService(this.rl, this.socket).viewMenu();
        });

        this.socket.on('feedbackAdded', (message) => {
            console.log(message);
            console.log('---------------------------------------');
            new EmployeeService(this.rl, this.socket, this.authService).viewMenu(this.userId!);
        });

        this.socket.on('ProfileUpdated', (message) => {
            console.log(message);
            console.log('---------------------------------------');
            new EmployeeService(this.rl, this.socket, this.authService).viewMenu(this.userId!);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.rl.close();
            
        });
    };
}

export default SocketHandler;
