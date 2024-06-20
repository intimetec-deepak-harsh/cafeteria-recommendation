import { Socket } from 'socket.io';
import UserService from '../controller/authController';

class SocketHandler {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public setupSocketEvents(socket: Socket): void {
        console.log('Socket handler initiated for socket ID:', socket.id);

        socket.on('authenticate', async (data) => {
            console.log('Authenticate event received:', data);
            const { email, password } = data;

            try {
                const user = await this.userService.authenticateUser(email, password);
                if (user && user.length > 0) {
                    console.log('Authenticated User:', user[0]); 
                    const userName = user[0].name;                    
                    socket.emit('user', userName);
                    socket.emit('authenticate', email);
                    const roleId = user[0].roleId;                    
                    console.log('Role ID:', roleId); 
                    if (!roleId) {
                        throw new Error('User role ID is missing or undefined');
                    }

                    const role = await this.userService.getUserRole(roleId);
                    if (role && role.length > 0) {
                        const roleName = role[0].role;                       
                        socket.emit('role', roleName);
                    } else {
                        socket.emit('authentication_failed', 'Role not found');
                    }
                } else {
                    socket.emit('authentication_failed', 'Authentication failed, Invalid User Credentials');
                }
            } catch (error) {
                console.error('Error during authentication:', error);
                socket.emit('error', 'Error occurred during authentication');
            }
        });

        socket.on('viewMenu', async () => {     
            const showMenu = await this.userService.getMenu();
            console.log(showMenu);

            if (showMenu && showMenu.length > 0) {
                const menuName = {showMenu}; 
               
                socket.emit('MenuDetails', menuName);
            }else {

            }

        });

        socket.on('addNewMenuItem', async (data) => {
            const { item_name, meal_type,rating,price,availability_status} = data;
            console.log('check data',data);
            
            try {
           const addMenuItem =  await this.userService.addNewMenuItem(item_name, meal_type, rating, price, availability_status);
                socket.emit('menuItemAdded', 'New menu item added successfully');
                
            } catch (error) {
                console.error('Error adding new menu item:', error);
                socket.emit('error','Error occurred during authentication'); 
            }
        });

        socket.on('updateExisitingMenuItem', async (data) => {
            console.log('check data',data);
            
            try {
           const addMenuItem =  await this.userService.updateExisitingMenuItem(data);
                socket.emit('menuItemUpdated', 'Menu item updated successfully');
                
            } catch (error) {
                console.error('Error adding new menu item:', error);
                socket.emit('error','Error occurred during authentication'); 
            }
        });

        socket.on('deleteExisitingMenuItem', async (data) => {
            console.log('check data',data);
            
            try {
           const addMenuItem =  await this.userService.deleteExisitingMenuItem(data);
                socket.emit('menuItemDeleted', 'Menu item deleted successfully');
                
            } catch (error) {
                console.error('Error deleteing menu item:', error);
                socket.emit('error','Error occurred during deleting'); 
            }
        });

        socket.on('viewFeedback', async () => {     
            const showFeedback = await this.userService.getFeedback();
            console.log(showFeedback);

            if (showFeedback && showFeedback.length > 0) {
                const Feedbacks = {showFeedback}; 
               
                socket.emit('viewFeedback', Feedbacks);
            }else {

            }

        });



        socket.on('disconnect', () => {
            console.log('Connection closed for socket ID:', socket.id);
        });

        socket.on('error', (error) => {
            console.error('Socket error for socket ID:', socket.id, error);
        });
    }
}

export default SocketHandler;
