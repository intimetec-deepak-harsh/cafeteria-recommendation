import readline from 'readline';
import SocketHandler from '../Handler/socketHandler';

class LoginUI {
    public rlClosed = false;
    private isAuthenticating = false;

    constructor(
        private rl: readline.Interface,
        private socketHandler: SocketHandler,
        private callback: (role: string) => void
    ) {
        this.rl.on('close', () => {
            this.rlClosed = true;
        });

        this.setupSocketListeners();
    }

    public authenticateUser = () => {
        if (this.isAuthenticating) return;  
        this.isAuthenticating = true;

        this.promptUserCredentials();
    };

    public promptUserCredentials = () => {
        setTimeout(() => {
            this.rl.question('Enter email: ', (email) => {
                this.rl.question('Enter password: ', (password) => {
                    this.socketHandler.emitEvent('authenticate', { email, password });
                });
            });
        }, 100);
    };

    public setupSocketListeners = () => {
        this.socketHandler.onEvent('authenticated', (message) => {
            console.log(message);
            this.isAuthenticating = false;
        });

        this.socketHandler.onEvent('role', (role) => {
            console.log(`Welcome to Cafeteria Recommendation. Your Role is: ${role}`);
            console.log('--------------------------------------------');
            this.callback(role);
        });

        this.socketHandler.onEvent('authentication_failed', (message) => {
            console.error('Authentication failed:', message);
            this.isAuthenticating = false;  
            this.promptUserCredentials(); 
        });

        this.socketHandler.onEvent('disconnect', () => {
            console.error('Connection lost. Please reconnect.');
            if (!this.rlClosed) {
                this.rl.close();
            }
        });

        this.socketHandler.onEvent('connect', () => {
            if (!this.isAuthenticating) {
                this.promptUserCredentials();
            }
        });
    };
}

export default LoginUI;
