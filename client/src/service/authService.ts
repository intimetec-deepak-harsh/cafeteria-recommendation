import readline from 'readline';
import { Socket } from 'socket.io-client';

class AuthService {
    constructor(private rl: readline.Interface, private socket: Socket, private callback: (role: string) => void) {}

    public authenticateUser = () => {
        this.rl.question('Enter email: ', (email) => {
            this.rl.question('Enter password: ', (password) => {
                this.socket.emit('authenticate', { email, password }, (error: any) => {
                    if (error) {
                        console.error('Authentication failed:', error);
                        this.rl.close();
                    }
                });
            });
        });
    };

    public setupSocketListeners = () => {
        this.socket.on('authenticated', (message) => {
            console.log(message);
        });

        this.socket.on('role', (role) => {
            console.log(`Welcome to Cafeteria Recommendation. Your Role is: ${role}`);
            console.log('--------------------------------------------');
            this.callback(role);
        });

        this.socket.on('authentication_failed', (message) => {
            console.error('Authentication failed:', message);
            this.authenticateUser(); // Prompt the user to try again
        });
    };
}

export default AuthService;
