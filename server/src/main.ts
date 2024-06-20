import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import SocketHandler from './services/SocketHandler';
import { connectDB } from './database/connection';

const PORT = 8080;

const startServer = async () => {
    try {
        await connectDB();
        const server = createServer();
        const io = new SocketIOServer(server, {
            cors: { origin: '*',  }
        });

        const socketHandler = new SocketHandler();

        io.on('connection', (socket) => {
            socketHandler.handleConnection(socket);
        });

        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
