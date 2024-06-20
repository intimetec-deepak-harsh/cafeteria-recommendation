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
});


socket.on('authenticated', (message) => {
    console.log(message);
});

socket.on('role', (message) => {
    console.log(`Welcome, ${username} to Cafeteria Recommendation. Your Role is: ${message}`);
    console.log('--------------------------------------------');
    const role = message;
    if (role === 'Admin') {
    viewMenu(role);
    }else if (role === 'Chef') {     
    viewMenu(role);
    }else if (role === 'Employee'){
    viewMenu(role);
    }else{
    rl.close();
    }
});

socket.on('menuItemAdded', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    viewMenu('Admin');
});

socket.on('menuItemUpdated', (message) => {
    console.log(message);
    console.log('---------------------------------------');
    viewMenu('Admin');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    rl.close();
});

function viewMenu(role: string) {
    if (role === 'Admin') {
        console.log('1. View All Menu Items');
        console.log('2. Add New Menu Items');
        console.log('3. Update Menu Items');
        console.log('4. Delete Menu Items');
        console.log('5. Exit');

        rl.question('Select Option: ', (option) => {
       
            if (option === '1') {    

            viewAllMenuItem();

            }else if(option === '2'){
            addMenuItem();
            }else if (option === '3'){
             console.log('update Menu Item');
             updateExistingMenuItem();
            }else if (option === '4') {
             console.log('Delete Menu Item');
             deleteExisitngMenuItem();
            } else if (option === '5') {
                console.log('Exiting...');
                rl.close();
                socket.disconnect();
            } else {
              console.log('Invalid option, please try again.');
              viewMenu(role);
            }
        });    

    } else if (role === 'Chef') {
        console.log('1. View All Menu Items');
        console.log('2. View Feedback');
        console.log('5. Exit');

    } else if (role === 'Employee') {
        console.log('1. View All Menu Items');
        console.log('2. Give Feedback');
        console.log('5. Exit');
    }

}

function viewAllMenuItem() {
    socket.emit('viewMenu');
    socket.on('MenuDetails',(MenuDetails) => {
       MenuDetails.showMenu.forEach((item: any) => {
       console.log(`Id: ${item.itemId},Name: ${item.itemName}, Meal Type: ${item.meal_type}, Rating: ${item.rating}, Price: ${item.price}, Availability: ${item.availability_status === 1 ? 'Yes' : 'No'}`);
       });
       console.log('---------------------------------------');
       viewMenu('Admin');
    });
}

function addMenuItem() {
    rl.question('Enter Item Name: ', (itemName) => {
    rl.question('Enter Meal Type(breakfast/lunch/dinner): ', (meal_type) => {
    rl.question('Enter Price: ', (price) => {
    rl.question('Enter Availability (1 for Yes/0 for No): ', (availability_status) => {
    rl.question('Enter rating: ', (rating) => {
      socket.emit('addNewMenuItem', { itemName, meal_type, rating,price,availability_status });
        });
        });
        });
     });  
    });    

}

function updateExistingMenuItem() {
    rl.question('Enter Item ID: ', (itemId) => {
        rl.question('Enter Item Name: ', (itemName) => {
            rl.question('Enter Meal Type(breakfast/lunch/dinner): ', (meal_type) => {
            rl.question('Enter Price: ', (price) => {
            rl.question('Enter Availability (1 for Yes/0 for No): ', (availability_status) => {
                rl.question('Enter rating: ', (rating) => {
                socket.emit('updateExisitingMenuItem', { itemId, itemName, meal_type, rating,price,availability_status });
            });
            });
            });
            });
         });  
        });
}


function deleteExisitngMenuItem() {
    rl.question('Enter Item ID: ', (itemId) => {
        socket.emit('deleteExisitingMenuItem', {itemId});

    });
}