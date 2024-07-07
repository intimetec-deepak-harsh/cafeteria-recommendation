import { io } from 'socket.io-client';
import readline from 'readline';
import AdminService from '../client/src/service/adminService';
import ChefService from '../client/src/service/chefService';
import EmployeeService from '../client/src/service/employeeService';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let username: string;
const socket = io('http://localhost:8080');

//function to authenticate user email and password
const authenticateUser = () => {
    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            socket.emit('authenticate', { email, password },(error: any) => {

                                if (error) {
                    console.error('Authentication failed:', error);
                    rl.close();
                }
            });
        });
    });
};

// Function to handle role-based navigation after authentication
const handleRoleBasedNavigation = (role: string) => {
    switch (role) {
        case 'Admin':
            AdminService.viewMenu(rl, socket);
            break;
        case 'Chef':
                 new  ChefService(rl, socket).viewMenu();
            break;
        case 'Employee':
            EmployeeService.viewMenu(rl, socket);
            break;
        default:
            rl.close();
            break;
    }
};

// Event listener when socket connects to server
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    console.log('successfully connected with server');
    authenticateUser();
});

// Event listener when user is authenticated
socket.on('user',(message)=> {
 username = message;
});

socket.on('authenticated', (message) => {
    console.log(message);
});

// Event listener when user's role is received
socket.on('role', (message) => {
    console.log(`Welcome, ${username} to Cafeteria Recommendation. Your Role is: ${message}`);
    console.log('--------------------------------------------');
    const role = message;
    handleRoleBasedNavigation(role);
});

socket.on('menuItemAdded', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    AdminService.viewMenu(rl,socket);
});

socket.on('menuItemUpdated', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    AdminService.viewMenu(rl,socket);
});

socket.on('menuItemDeleted', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    AdminService.viewMenu(rl,socket);
});

socket.on('feedbackAdded', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    EmployeeService.viewMenu(rl,socket);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    rl.close();
});

export { rl, socket };