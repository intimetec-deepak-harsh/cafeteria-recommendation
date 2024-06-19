import { io } from 'socket.io-client';
import readline from 'readline';
import { adminMenu } from '../client/src/menu/admin';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const socket = io('http://localhost:8080');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);

    rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', (password) => {
            socket.emit('authenticate', { email, password });
        });
    });
});

socket.on('authenticated', (message) => {
    console.log(message);
    // rl.close();
});

socket.on('role', (message) => {
    console.log("Hello!", message+',Welcome to Cafeteria Recommendation.');
    const role = message;
    if (role === 'Admin') {
        socket.emit('menu');
    }
});

// socket.on('menu', (message) => {
//     console.log("menu", message);
//     rl.close();
// });

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

function showMenu(role: string) {
    console.log('Type 1 to Add New Menu Item');
    console.log('Type 2 to Update an Existing Menu Item');
    console.log('Type 3 to View All Menu Item');
    console.log('Type 4 to Exit');
    rl.question('Please select the operation you want to perform: ', (selectedOption) => {
        if (selectedOption === '1') {
            addNewMenuItem(role);
        } else if (selectedOption === '2') {
            updateMenuItem();
        } else if (selectedOption === '3') {
            viewAllMenuItems();
        } else if (selectedOption === '4') {
            console.log('Exiting...');
            rl.close();
            socket.disconnect();
        } else {
            console.log('Invalid option, please try again.');
            showMenu(role); // Call showMenu again to prompt user
        }
    });
}

function addNewMenuItem(role: string) {
    rl.question('Enter menu item name: ', (name) => {
        rl.question('Enter menu item category: ', (category) => {
            rl.question('Enter menu item rating: ', (rating) => {
                socket.emit('addMenuItem', { name, category, rating, role });
                showMenu(role); // Call showMenu again after adding item
            });
        });
    });
}

function updateMenuItem() {
    rl.question('Enter the ID of the menu item to update: ', (id) => {
        rl.question('Enter new menu item name: ', (name) => {
            rl.question('Enter new menu item category: ', (category) => {
                rl.question('Enter new menu item rating: ', (rating) => {
                    socket.emit('updateMenuItem', { id, name, category, rating });
                    showMenu('Admin'); // Call showMenu again after updating item
                });
            });
        });
    });
}

function viewAllMenuItems() {
    console.log('function called')
    socket.emit('getAllMenuItems');
}
