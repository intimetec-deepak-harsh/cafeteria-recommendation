import { Socket } from 'socket.io';
import UserService from '../services/userService';
import MenuService from '../services/menuService';
import LogService from '../services/logService';
import NotificationService from '../services/notificationService';
import RecommendationService from '../services/recommendationService'
import  FeedbackService  from '../services/feedbackService';
import DateService from '../services/DateService';
import { Engine } from '../recommendationEngine/engine';
import { FeedbackQuestionsData } from '../interface/FeedbackQuestionData';

class SocketHandler {
    private userService: UserService;
    private menuService: MenuService;
    private LogService: LogService ;
    private NotificationService: NotificationService;
    private RecommendationService: RecommendationService;
    private feedbackService: FeedbackService = new FeedbackService;

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
                console.log('Authenticated User:', user[0]);
                
                if (user && user.length > 0) {
                    const userName = user[0].name;                    
                    socket.emit('user', userName);
                    const userID = user[0].userId;       

                    socket.emit('userID', userID);
                    socket.emit('authenticated', 'Authentication successful');
                    socket.emit('authenticate', email);
                    const roleId = user[0].roleId;                    
                    if (!roleId) {
                        throw new Error('User role ID is missing or undefined');
                    }

                    const role = await this.userService.getUserRole(roleId);
                    if (role && role.length > 0) {
                        const roleName = role[0].role;                       
                        socket.emit('role', roleName);

                  
                    //log data here
                    const action = `${userName} logged in as ${role[0].role}`;
                    console.log('see action:', action);
                    await LogService.insertIntoLog(action, user[0].userId as number);

                    } else {
                        socket.emit('authentication_failed', 'Role not found');
                    }
                } else {
                    socket.emit('authentication_failed', 'Authentication failed, Invalid User Credentials');
                }
            } catch (error) {
                console.error('Error during authentication:', error);
                socket.emit('error', 'Wrong credentials, Please Try Again');
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
                const menuName = { showMenu };
                socket.emit('getMealData', menuName);
            } else {
                // Handle the case where there is no data
                console.log('No meal types found.');
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
            const { item_name, meal_type,price,availability_status, dietary_type, spice_type, cuisine_type,sweet_tooth_type} = data;
            console.log('check data',data);            
            try {
           const menuId  =  await this.userService.addNewMenuItem(item_name, meal_type, price, availability_status, dietary_type, spice_type, cuisine_type,sweet_tooth_type);
            socket.emit('menuItemAdded', 'New menu item added successfully');

              const type = 'menuUpdate';
              const message = `New menu item '${item_name}' has been added in the list.`;

              await NotificationService.addNotification(type, message, menuId);
             console.log('Notification added successfully for the new menu item.');
                
            } catch (error) {
                console.error('Error adding new menu item:', error);
                socket.emit('error','Error occurred during authentication'); 
            }
        });

        socket.on('getRecommendedFood', async (category) => {                        
        const showRecommendation = await this.RecommendationService.getRecommendedFood(category);     
        console.log('show recoomendation',showRecommendation);         

        if (showRecommendation && showRecommendation.length > 0) {
            const showRecommendationData = {showRecommendation}; 
           
            socket.emit('getRecommendedFood', showRecommendationData);            
        }
        });

        //get all recoommednagion 

        socket.on('getAllItemRecommended', async () => {
            try {                        
                const showAllRecommendation = await this.RecommendationService.getAllItemRecommendedFood();     
               // console.log('show all recommendation daTA', showAllRecommendation);         
        
                if (showAllRecommendation && showAllRecommendation.length > 0) {
                    for (const recommendation of showAllRecommendation) {
                        const { foodItem, itemId, meal_type_name, meal_type: meal_id, avgRating, avgSentimentRating, combinedAvg } = recommendation;
        
                        // Add the recommendation item to the menu_item_audit table
                        await this.RecommendationService.addMenuItemAudit([{
                            foodItem,itemId,meal_type_name,meal_id,avgRating,avgSentimentRating,combinedAvg,EntryDate: new Date() }]);
                    }
        
                    const showAllRecommendationData = { showAllRecommendation }; 
                    socket.emit('getAllItemRecommended', showAllRecommendationData);           
                }
            } catch (error) {
                console.error('Error processing recommendations:', error);
                socket.emit('error', 'Error occurred while processing recommendations'); 
            }
        });
        



        socket.on('rolloutRecommendedFood', async (category) => {
            try {
                const recommendedItems = await this.RecommendationService.analyzeRolloutInput(category);
                socket.emit('recommendedItemsByChef', recommendedItems);
            } catch (error) {
                console.error('Database query error:', error);
                socket.emit('recommendedItemsByChef', 'Error in fetching feedback.');
            }
        });
        

        socket.on('generateMonthlyReport', async ({ startDate, endDate }) => {
            try {
                const generateReport = await this.feedbackService.getFeedbackMonthlyReport(startDate, endDate);
                console.log(generateReport);
                
                socket.emit('generateFeedbackReport', generateReport);
            } catch (error) {
                console.error('Database query error:', error);
                socket.emit('generateFeedbackReport', 'Error in Generating feedback Monthly Report.');
            }
        });
        
        socket.on('viewVotes', async (itemCategory) =>{          
            try{
                console.log('item category',itemCategory);
                
               const votedItems = await this.feedbackService.viewEmployeeVotes(itemCategory.category);
               console.log('voted item',votedItems);

               if ('message' in votedItems) {
               socket.emit('userVotedMenu', { message: votedItems.message });
               }else{
               socket.emit('userVotedMenu',votedItems);
               }
            } catch(error) {
                console.error('Database query error:', error);
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

        

        socket.on('DiscardMenuItem', async (data) => {
            console.log('check data',data);            
            try {
           const addMenuItem =  await this.userService.DiscardMenuItem(data);
                socket.emit('menuItemDeleted', 'Menu item Discarded successfully');
                
            } catch (error) {
                console.error('Error deleteing menu item:', error);
                socket.emit('error','Error occurred during deleting'); 
            }
        });

        //addDetailedFeedbackQuestions
        socket.on('addDetailedFeedbackQuestions', async (data:FeedbackQuestionsData) => {
            const { itemId,itemName, questions} = data;
            console.log('check data',data);            
            try {
           const menuId  =  await this.feedbackService.addDetailFeedbackQuestions(itemId, questions);
            socket.emit('feedbackQuestion', 'New Feedback Question Rollout successfully');

              const type = 'recommendation';
              const message = `New Feedback Quesiton for '${itemName}' has been added in the list.
              Here are the Questions:
              '${questions}'`;

              await NotificationService.addNotification(type, message, itemId);
             console.log(`Notification added successfully for the new menu item. `);
                
            } catch (error) {
                console.error('Error adding new menu item:', error);
                socket.emit('error','Error occurred during authentication'); 
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

           socket.on('viewDiscardMenuItem', async () => {         
               
            const showMenuItem = await this.userService.getDiscardMenu();
            console.log('show Data',showMenuItem);

            if (showMenuItem && showMenuItem.length > 0) {
                        
                const Logs = {showMenuItem};                
                socket.emit('viewDiscardMenuItem', Logs);
            }else {
                socket.emit('noData', 'No data available;');
            }
           })

           socket.on('seeNotifications', async () => {     
            const showNotifications = await this.NotificationService.seeNotifications();
            console.log(showNotifications);

            if (showNotifications && showNotifications.length > 0) {
                const Notifications = {showNotifications}; 

                socket.emit('showNotification', Notifications);
            }
           });  

           socket.on('showEmployeeNotifications', async () => {     
            try {
                const showNotificationsEmployee = await this.NotificationService.seeEmployeeNotifications();
                console.log(showNotificationsEmployee);
        
                if (showNotificationsEmployee && showNotificationsEmployee.length > 0) {
                    const EmployeeNotifications = { showNotificationsEmployee }; 
                    socket.emit('getEmployeeNotification', EmployeeNotifications);
                } else {
                    socket.emit('getEmployeeNotification', { message: 'No latest notifications.' });
                }
            } catch (error) {
                console.error('Error fetching employee notifications:', error);
            }
        });
        

        socket.on('giveFeedback', async (data) => {
            const {user_Id, item_Id, Comment, Rating,feedbackDate} = data;
            console.log('check data for feedback',data);
            
            try {
           const sendFeedback =  await this.userService.giveFeedback(user_Id,item_Id,Comment, Rating,feedbackDate);
                socket.emit('feedbackAdded', 'Feedback added successfully');
                
            } catch (error) {
                console.error('Error Sending Feedback item:', error);
                socket.emit('error','Error occurred during authentication'); 
            }
        });



        socket.on('getRolloutitem', async (data) => {
            const meal_type = data.meal_type;  
            console.log('meal type',meal_type);
                       
            try {
                const getRolloutdata = await this.userService.getRolloutData(meal_type);
                console.log('get rollout data',getRolloutdata);
                
                socket.emit('getRolloutData', getRolloutdata);
            } catch (error) {
                console.error('Error getting Rollout item:', error);
                socket.emit('error', 'Error occurred');
            }
        });
        
        socket.on('insertVotedItem', async (data) => {
            console.log('voted',data);            
            const userID = data.userId;
            const menuId = data.selectItem;   
            const Category = data.selectedMealType;
            
            console.log('insert vote',Category);
            
            try {
                const insertVote = await this.userService.giveRolloutVote(userID,menuId,Category);
                socket.emit('votegiven', insertVote);
            } catch (error) {
                console.error('Error giving vote for item:', error);
                socket.emit('error', 'Error occurred');
            }
        });

        socket.on('UpdateProfile', async (data) => {
           
            const { user_Id, user_dietary_preference, user_spice_level, user_cuisine_preference, user_sweet_tooth } = data;
            console.log('check data for update profile', data);
        
            try {
                const updateUserProfile = await this.userService.updateProfile(user_Id, user_dietary_preference, user_spice_level, user_cuisine_preference, user_sweet_tooth);
                socket.emit('ProfileUpdated', 'Profile Updated successfully');
            } catch (error) {
                console.error('Error updating Profile:', error);
                socket.emit('error', 'Error occurred during updating profile');
            }
        });
     
        socket.on('updateItemAvailability', async (data) => {
            try {
                 await this.userService.updateItemAvailability(data);
                socket.emit('menuItemUpdated', 'Menu item availability updated successfully');
        
                const menuId = data.item_Id;
                const item_data = await this.userService.getSpecificMenu(menuId);
        
                if (item_data && item_data.length > 0) {
                    const item_name = item_data[0].item_name;
                    const type = 'availabilityChange';
                    let message;
        
                    if (data.availability_status === '0') {
                        message = `Menu item '${item_name}' not available`;
                    } else {
                        message = `Menu item '${item_name}' now available`;
                    }
        
                    await NotificationService.addNotification(type, message, menuId);
                    console.log('Notification added successfully for the updated menu item.');
                } else {
                    console.error('Item data is empty or invalid');
                    socket.emit('error', 'Failed to retrieve item data');
                }
            } catch (error) {
                console.error('Error updating menu item availability:', error);
                socket.emit('error', 'Error occurred during authentication');
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
