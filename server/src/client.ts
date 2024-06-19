import * as readline from 'readline';
import { io } from 'socket.io-client';


const PORT = 8080;
const socket = io(`http://localhost:${PORT}`);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
socket.on('connect', () => {
    console.log(`Connected to server with ID: ${socket.id}`);
    rl.question('Enter your email: ', (email) => {
        rl.question('Enter your password: ', (password) => {
            socket.emit('authenticate', email, password);
            socket.on('authResult', (data: { message: string, role: string | null }) => {
                console.log(data.message);
                if (data.role === 'Admin') {
                    showMenu(data.role);
                } else if (data.role === 'Chef') {
                    viewAllMenuItems();
                } else {
                    rl.close();
                }
            });
            socket.on('menuItemAddResult', (message: string) => {
                console.log(message);
                showMenu('Admin');
            });
            socket.on('menuItemUpdateResult', (message: string) => {
                console.log(message);
                showMenu('Admin');
            })
            socket.on('allMenuItems', (items: any[]) => {
                console.log('Menu Items:');
                items.forEach(item => {
                    console.log(`ID: ${item.ItemId}, Name: ${item.ItemName}, Category: ${item.category}, Rating: ${item.rating}`);
                });
                showMenu('Admin'); 
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
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
                showMenu(role);
            }
        });
    }
    function addNewMenuItem(role: string) {
        rl.question('Enter menu item name: ', (name) => {
            rl.question('Enter menu item category: ', (category) => {
                rl.question('Enter menu item rating: ', (rating) => {
                    socket.emit('addMenuItem', { name, category, rating, role });
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
                    });
                });
            });
        })
    }
    function viewAllMenuItems() {
        socket.emit('getAllMenuItems');
    }
});