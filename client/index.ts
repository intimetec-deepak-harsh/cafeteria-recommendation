import { io } from 'socket.io-client';
import readline from 'readline';
import AdminService from './src/service/adminService';
import ChefService from './src/service/chefService';
import EmployeeService from './src/service/employeeService';
import AuthService from './src/service/authService';
import SocketHandler from './src/service/socketHandler';

class App {
    private rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    private username: string | undefined;
    private userId: number | undefined;
    private socket = io('http://localhost:8080');
    private authService: AuthService;
    private socketHandler: SocketHandler;

    constructor() {
        this.authService = new AuthService(this.rl, this.socket, this.handleRoleBasedNavigation);
        this.socketHandler = new SocketHandler(this.rl, this.socket, this.authService, this.handleRoleBasedNavigation, this.setUserId);
        this.socketHandler.setupSocketListeners();
    }

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
                new EmployeeService(this.rl, this.socket,this.authService).viewMenu(this.userId!);
                break;
            default:
                this.rl.close();
                break;
        }
    };

    private setUserId = (userId: number) => {
        this.userId = userId;
    }
}

export default App;
new App();
