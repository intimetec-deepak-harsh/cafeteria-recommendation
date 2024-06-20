import { io } from 'socket.io-client';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let username: string;
const socket = io('http://localhost:8080');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    console.log('successfully connected with server');

    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            socket.emit('authenticate', { email, password });
        });
        
    });    
});

socket.on('user',(message)=> {
 username = message;
console.log('Welcome',username);
});


socket.on('authenticated', (message) => {
    console.log(message);
    console.log('Hello',message);
    // rl.close();
});

socket.on('role', (message) => {
    console.log(`your role is ${message}, Welcome,${username} to Cafeteria Recommendation.`);
    const role = message;
    if (role === 'Admin') {
        // socket.emit('menu');
        console.log('Admin ho bhai');
    }
});


socket.on('disconnect', () => {
    console.log('Disconnected from server');
    rl.close();
});
