import { Socket } from 'socket.io';
import UserService from '../controllers/authController';

class SocketHandler {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public handleConnection(socket: Socket): void {
        console.log('Socket handler initiated for socket ID:', socket.id);

        socket.on('authenticate', async (data) => {
            console.log('Authenticate event received:', data);
            const { email, password } = data;

            try {
                const user = await this.userService.authenticateUser(email, password);
                console.log("USER:", user);

                if (user && user.length > 0) {
                    console.log('User authenticated successfully');
                    console.log('Authenticated User:', user[0]); // Log the authenticated user details

                    const roleId = user[0].roleId;
                    console.log('Role ID:', roleId); 
                    if (!roleId) {
                        throw new Error('User role ID is missing or undefined');
                    }

                    const role = await this.userService.getUserRole(roleId);
                    if (role && role.length > 0) {
                        const roleName = role[0].role;
                        socket.emit('role', roleName);

                        const menu = await this.userService.getMenu(roleName);
                        socket.emit('menu', menu);
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

        socket.on('disconnect', () => {
            console.log('Connection closed for socket ID:', socket.id);
        });

        socket.on('error', (error) => {
            console.error('Socket error for socket ID:', socket.id, error);
        });
    }
}

export default SocketHandler;
