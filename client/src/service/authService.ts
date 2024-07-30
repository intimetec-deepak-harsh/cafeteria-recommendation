// AuthService.ts
import readline from 'readline';
import { Socket } from 'socket.io-client';

class AuthService {
    public rlClosed = false;  

    constructor(private rl: readline.Interface, private socket: Socket, private callback: (role: string) => void) {
        this.rl.on('close', () => {
            this.rlClosed = true;
        });
    }

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
            this.authenticateUser(); 
        });

        this.socket.on('disconnect', () => {
            console.error('Connection lost. Please reconnect.');
            if (!this.rlClosed) {
                this.rl.close();
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to the server.');
            if (this.rlClosed) {
                this.rlClosed = false;
                this.rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
            }
            this.authenticateUser();
        });
    };
}

export default AuthService;
