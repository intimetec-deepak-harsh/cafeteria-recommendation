import { Socket } from 'socket.io';
import { authenticateUser, getUserRole } from '../controllers/authController';

export const handleSocketIO = (socket: Socket) => {
    console.log('Socket handler initiated for socket ID:', socket.id);

    socket.on('authenticate', async (data) => {
        console.log('Authenticate event received:', data);
        const { email, password } = data;

        try {
            const user = await authenticateUser(email, password);
            console.log("USER : " , user);
            
            if (user && user.length > 0) {
                console.log('if ');
                
                const role = await getUserRole(user[0].roleId);
                if (role) {
                    console.log("logging" , role);
                    
                    socket.emit('role', `${role[0].role}`);
                } else {
                    socket.emit('authentication_failed', 'Role not found');
                }
            } else {
                socket.emit('authentication_failed', 'Authentication failed');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            socket.emit('error', 'Error occurred during authentication');
        }
    });

    

    socket.on('disconnect', () => {
        console.log('Connection closed for socket ID:', socket.id);
    });

    socket.on('error', (error) => {
        console.error('Socket error for socket ID:', socket.id, error);
    });
};


