import { io } from 'socket.io-client';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const socket = io('http://localhost:8080');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    console.log('successfully connected with server');
});

socket.on('authenticated', (message) => {
    console.log(message);
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
    rl.close();
});
