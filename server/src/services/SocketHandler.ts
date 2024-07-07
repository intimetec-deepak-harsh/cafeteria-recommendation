import { Socket } from 'socket.io';
import UserService from './userService';
import MenuService from '../services/menuService';
import LogService from '../services/LogService';
import NotificationService from '../services/notificationService';
import RecommendationService from '../services/recommendationService'
import { FeedbackService } from './feedbackService';

class SocketHandler {
    private userService: UserService;
    private menuService: MenuService;
    private LogService: LogService ;
    private NotificationService: NotificationService;
    private RecommendationService: RecommendationService;

    constructor() {
        this.userService = new UserService();
        this.menuService = new MenuService();
        this.LogService = new LogService();
        this.NotificationService = new NotificationService();
        const feedbackService = new FeedbackService();
         this.RecommendationService = new RecommendationService(feedbackService);
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
                    //log data here
                    const action = `${userName} logged in as ${role[0].role}`;
                    console.log('see action:', action);
                    const logOutput = await LogService.insertIntoLog(
                      action,
                      user[0].userId as number
                    );

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
        
        socket.on('viewMealType', async () => {     
            const showMenu = await this.userService.getMealType();
            console.log(showMenu);

            if (showMenu && showMenu.length > 0) {
                const menuName = {showMenu}; 
               
                socket.emit('MenuDetails', menuName);
            }else {

            }
        });


        socket.on('viewAvailableMenuItem', async () => {     
            const showMenu = await this.userService.getAvailableMenuItems();
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

        socket.on('getRecommendedFood', async (category) => {              
        const showRecommendation = await this.RecommendationService.getRecommendedFood(category);     
        console.log(showRecommendation);

        if (showRecommendation && showRecommendation.length > 0) {
            const showRecommendationData = {showRecommendation}; 
           
            socket.emit('getRecommendedFood', showRecommendationData);
             
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
            }
           });

           socket.on('viewLogs', async () => {     
            const showLogs = await this.LogService.getLog();
            console.log(showLogs);

            if (showLogs && showLogs.length > 0) {
                const Logs = {showLogs}; 
               
                socket.emit('viewLogs', Logs);
            }
           });

           socket.on('seeNotifications', async () => {     
            const showNotifications = await this.NotificationService.seeNotifications();
            console.log(showNotifications);

            if (showNotifications && showNotifications.length > 0) {
                const Notifications = {showNotifications}; 

                socket.emit('showNotification', Notifications);
            }
           });  
 


        socket.on('giveFeedback', async (data) => {
            const {userId, item_Id, Comment, Rating,feedbackDate} = data;
            console.log('check data for feedback',data);
            
            try {
           const sendFeedback =  await this.userService.giveFeedback(userId,item_Id,Comment, Rating,feedbackDate);
                socket.emit('feedbackAdded', 'Feedback added successfully');
                
            } catch (error) {
                console.error('Error Sending Feedback item:', error);
                socket.emit('error','Error occurred during authentication'); 
            }
        });

        socket.on('updateItemAvailability', async (data) => {
            console.log('check data',data);
            
            try {
           const updateMenuItemAvailability =  await this.userService.updateItemAvailability(data);
                socket.emit('menuItemUpdated', 'Menu item Availability updated successfully');
                
            } catch (error) {
                console.error('Error Updating menu item availability:', error);
                socket.emit('error','Error occurred during authentication'); 
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
