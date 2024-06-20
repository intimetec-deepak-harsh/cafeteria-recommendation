import { Socket } from 'socket.io';
import UserService from '../controllers/authController';

class SocketHandler {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public handleConnection(socket: Socket): void {
        console.log('Socket handler initiated for socket ID:', socket.id);

        socket.on('disconnect', () => {
            console.log('Connection closed for socket ID:', socket.id);
        });

        socket.on('error', (error) => {
            console.error('Socket error for socket ID:', socket.id, error);
        });
    }
}

export default SocketHandler;
