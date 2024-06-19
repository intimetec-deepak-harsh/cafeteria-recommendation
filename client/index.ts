import { io } from 'socket.io-client';
import readline from 'readline';
import {adminMenu} from '../client/src/menu/admin'

// Create a readline interface for reading input from the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Connect to the server
const socket = io('http://localhost:8080');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);

    // Prompt user for email and password
    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            // Emit the authenticate event to the server
            socket.emit('authenticate', { email, password });
        });
    });
});

// Handle authentication responses
socket.on('authenticated', (message) => {
    console.log(message);
    rl.close();
});
socket.on('role', (message) => {
    console.log("Role is" , message);

    const role = message;
    console.log(  "client" , role);
    
    if(role == 'Admin'){
     adminMenu.showAdminMenu();
        }
    rl.close();
});

socket.on('authentication_failed', (message) => {
    console.log(message);
    rl.close();
});

socket.on('error', (message) => {
    console.log(message);
    rl.close();
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
