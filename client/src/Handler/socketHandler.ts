import { Socket } from 'socket.io-client';

class SocketHandler {
    constructor(private socket: Socket) {}

    public setupSocketListeners(): void {
        this.socket.on('connect', () => {
            console.log('Connected to the server.');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from the server.');
        });

    
    }

    public emitEvent(eventName: string, data?: any, callback?: (response: any) => void): void {
        if (callback) {
            this.socket.emit(eventName, data, callback);
        } else {
            this.socket.emit(eventName, data);
        }
    }

    public onEvent(eventName: string, listener: (data: any) => void): void {
        this.socket.on(eventName, listener);
    }

    public offEvent(eventName: string, listener: (data: any) => void): void {
        this.socket.off(eventName, listener);
    }

    public disconnect() {
        this.socket.disconnect();
    }

}

export default SocketHandler;
