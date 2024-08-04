import { io } from 'socket.io-client';
import readline from 'readline';
import AdminUI from './src/ClientUI/adminUI';
import ChefUI from './src/ClientUI/chefUI';
import EmployeeUI from './src/ClientUI/employeeUI';
import AuthUI from './src/ClientUI/loginUI';
import SocketHandler from './src/Handler/socketHandler';

class App {
    private rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    private username: string | undefined;
    private userId: number | undefined;
    private socket = io('http://localhost:8080');
    private socketHandler: SocketHandler;
    private authUI: AuthUI;

    constructor() {
        this.socketHandler = new SocketHandler(this.socket);
        this.authUI = new AuthUI(this.rl, this.socketHandler, this.handleRoleBasedNavigation);

        this.socketHandler.setupSocketListeners();
        this.authUI.loginUser();
    }

    private handleRoleBasedNavigation = (role: string) => {
        switch (role) {
            case 'Admin':
                new AdminUI(this.rl, this.socketHandler).viewMenu();
                break;
            case 'Chef':
                new ChefUI(this.rl, this.socketHandler).viewMenu();
                break;
            case 'Employee':
                new EmployeeUI(this.rl, this.socketHandler, this.authUI).viewMenu(this.userId!);
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
