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

const authenticateUser = () => {
    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            socket.emit('authenticate', { email, password });
        });
    });
};

const handleRoleBasedNavigation = (role: string) => {
    if (role === 'Admin') {
        AdminService.viewMenu(rl, socket);
    } else if (role === 'Chef') {
        ChefService.viewMenu(rl, socket);
    } else if (role === 'Employee') {
        EmployeeService.viewMenu(rl, socket);
    } else {
        rl.close();
    }
};

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    console.log('successfully connected with server');
    authenticateUser();
});

socket.on('user',(message)=> {
 username = message;
});

socket.on('authenticated', (message) => {
    console.log(message);
});

socket.on('role', (message) => {
    console.log(`Welcome, ${username} to Cafeteria Recommendation. Your Role is: ${message}`);
    console.log('--------------------------------------------');
    const role = message;
    if (role === 'Admin') {
        AdminService.viewMenu(rl,socket);
    }else if (role === 'Chef') {     
        ChefService.viewMenu(rl,socket);
    }else if (role === 'Employee'){
     EmployeeService.viewMenu(rl,socket);
    }else{
    rl.close();
    }
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